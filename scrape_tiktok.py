import pandas as pd
import time
import re
import os
import unicodedata
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

# --- Configuration ---
INPUT_FILE = 'companies.csv'
OUTPUT_FILE = 'companies_tiktok_filled.csv'
# If you want to continue from the output file (resume mode), set this to True
RESUME_FROM_OUTPUT = True

# Column names in CSV
COL_COMPANY_NAME = 'company_name'
COL_TIKTOK_URL = 'tiktok_url'
COL_TIKTOK_FOLLOWERS = 'tiktok_followers'

# --- Helpers ---

def normalize_text(text):
    """Normalize text to NFKC (handles full-width/half-width) and strip spaces."""
    if not text: return ""
    return unicodedata.normalize('NFKC', str(text)).strip()

def normalize_company_name(name):
    """Removes common suffixes to get the core name for checking."""
    if not name: return ""
    name = normalize_text(name)
    name = re.sub(r'(株式会社|有限会社|合同会社|（株）|\(株\))', '', name) # Regex implies removing any of these
    return name.strip()

def parse_count_str(count_str):
    """Parses '1.5M', '10K', '1万' etc into integers."""
    if not count_str: return 0
    s = normalize_text(count_str).replace(',', '')
    multiplier = 1
    
    if '万' in s:
        multiplier = 10000
        s = s.replace('万', '')
    elif 'K' in s or 'k' in s:
        multiplier = 1000
        s = s.replace('K', '').replace('k', '')
    elif 'M' in s or 'm' in s:
        multiplier = 1000000
        s = s.replace('M', '').replace('m', '')
    elif 'B' in s or 'b' in s:
        multiplier = 1000000000
        s = s.replace('B', '').replace('b', '')

    try:
        return int(float(s) * multiplier)
    except:
        return 0

def setup_driver():
    print("Connecting to existing Chrome on port 9226...")
    options = webdriver.ChromeOptions()
    options.add_experimental_option("debuggerAddress", "127.0.0.1:9226")
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        # Set a reasonable page load timeout to prevent hanging
        driver.set_page_load_timeout(20) 
        return driver
    except Exception as e:
        print(f"\nError connecting to Chrome: {e}")
        print("IMPORTANT: You must start Chrome with remote debugging first!")
        print('Run this in Command Prompt: chrome.exe --remote-debugging-port=9226 --user-data-dir="C:\\selenium\\ChromeProfile_TikTok"')
        raise e

def safe_get(driver, url):
    """
    Tries to load a page. If it times out, stops loading but keeps the open page 
    (which is enough for scraping DOM usually).
    """
    try:
        driver.get(url)
    except TimeoutException:
        print(f"  [Warn] Page load timed out for {url}. Stopping load and proceeding.")
        try:
            driver.execute_script("window.stop();")
        except: pass
    except Exception as e:
        print(f"  [Error] Failed to load {url}: {e}")

# --- Search & Validate ---

def google_search_tiktok(driver, company_name):
    """Searches Google for '{company_name} tiktok' and returns the first result."""
    try:
        query = f"{company_name} tiktok"
        safe_get(driver, "https://www.google.com/")
        
        # Determine search box
        try:
            search_box = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.NAME, "q"))
            )
        except:
            # Fallback for some google versions
            search_box = driver.find_element(By.CSS_SELECTOR, 'textarea[name="q"]')
            
        search_box.clear()
        search_box.send_keys(query)
        search_box.send_keys(Keys.RETURN)
        
        time.sleep(2) # Wait for results
        
        # Find first result that goes to tiktok.com
        results = driver.find_elements(By.XPATH, '//a[contains(@href, "tiktok.com")]')
        
        for res in results:
            url = res.get_attribute('href')
            if not url: continue
            
            # Exclude non-profile subdomains/paths
            if "newsroom.tiktok.com" in url: continue
            if "careers.tiktok.com" in url: continue
            if "ads.tiktok.com" in url: continue
            if "business.tiktok.com" in url: continue
            if "support.tiktok.com" in url: continue
            if "creators.tiktok.com" in url: continue
            if "transparency.tiktok.com" in url: continue

            # Common scraping exclusions
            if "/video/" in url: continue 
            if "/tag/" in url: continue
            if "/discover/" in url: continue
            if "/search" in url: continue
            
            # Strict profile check: must contain '@'
            # Most profiles are tiktok.com/@username
            if "/@" not in url: continue

            return url
            
    except Exception as e:
        print(f"  [Error] Google Search failed: {e}")
        
    return None

def validate_tiktok_profile(driver, url, company_name, website_url=None):
    """
    Visits the URL, checks if the name matches loosely, scrapes followers/posts.
    Returns: (is_valid, followers_count, correct_url)
    """
    try:
        # Extra safety check for URL pattern before loading
        if "/@" not in url and "tiktok.com/@" not in url:
             print(f"  [Reject] URL does not look like a user profile (missing /@): {url}")
             return False, 0, url

        safe_get(driver, url)
        time.sleep(3)
        
        followers = 0
        posts = 0 # TikTok doesn't always show total posts in header easily, might need to count or find data-e2e
        
        # 1. Extract Stats using data-e2e attributes (TikTok specific)
        try:
            # Follower Count
            # Look for strong[data-e2e="followers-count"]
            f_elem = driver.find_element(By.CSS_SELECTOR, '[data-e2e="followers-count"]')
            if f_elem:
                f_val = f_elem.text
                followers = parse_count_str(f_val)
                print(f"  [DOM] Followers from data-e2e: {followers}")
            
            # Post Count
            # TikTok often displays Likes, Followers, Following. Total videos isn't always explicit in the same way.
            # But let's look for video count if available, or just check if videos items exist.
            # Usually user-post-item
            video_items = driver.find_elements(By.CSS_SELECTOR, '[data-e2e="user-post-item"]')
            posts = len(video_items)
            print(f"  [DOM] Visible Posts: {posts}")
            
        except Exception as e:
            print(f"  [DOM Info] Stats extraction issue: {e}")

        # Fallback to meta if DOM failed
        if followers == 0:
            try:
                 meta_elem = driver.find_element(By.CSS_SELECTOR, 'meta[name="description"]')
                 meta = meta_elem.get_attribute("content")
                 # Extract followers
                 f_match = re.search(r'([\d\.,BKkMm万]+)\s*(Followers|followers|フォロワー)', meta)
                 if f_match: followers = parse_count_str(f_match.group(1))
                 print(f"  [Meta Stats] Followers: {followers}")
            except: pass

        # 2. Validation Rules
        try:
            page_text = driver.find_element(By.TAG_NAME, "body").text
        except:
             page_text = ""
             
        core_name = normalize_company_name(company_name)
        
        # Name Validation: exact match of core name OR contains "公式" (Official) OR Website Domain Match
        name_match = core_name.lower().replace(" ", "") in page_text.lower().replace(" ", "")
        official_match = "公式" in page_text or "official" in page_text.lower()
        
        website_match = False
        if website_url and isinstance(website_url, str):
            # Simple domain extraction
            try:
                d = re.sub(r'^https?://', '', website_url)
                d = re.sub(r'^www\.', '', d)
                d = d.split('/')[0]
                
                if d and len(d) > 4: 
                    if d.lower() in page_text.lower():
                         website_match = True
                         print(f"  [Match] Website domain '{d}' found in profile.")
            except: pass

        if not (name_match or official_match or website_match):
             print(f"  [Reject] Name '{core_name}' not found, 'official' not found, and website match failed.")
             return False, 0, url

        # Post Count Validation
        # If we see 0 posts in DOM, it might just be loading issue or no posts.
        # Sticking to "5+" rule if possible, but for TikTok, dynamic loading might hide older posts.
        # But usually first batch is > 5 if active.
        if posts > 0 and posts < 5:
             # Check if it looks like an official account strongly?
             # For now, stick to the rule requested for Instagram/Twitter
             print(f"  [Reject] Low posts: {posts} < 5")
             return False, 0, url

        return True, followers, url

    except Exception as e:
        print(f"  [Error] Validation failed: {e}")
        return False, 0, url

# --- Main Loop ---

def main():
    # 1. Load Data
    file_to_read = INPUT_FILE
    if RESUME_FROM_OUTPUT and os.path.exists(OUTPUT_FILE):
        print(f"Resuming from {OUTPUT_FILE}...")
        file_to_read = OUTPUT_FILE
    
    print(f"Reading {file_to_read}...")
    try:
        df = pd.read_csv(file_to_read, encoding='cp932', low_memory=False) # Try Shift-JIS/CP932 first for Japanese CSVs
    except:
        try:
             df = pd.read_csv(file_to_read, encoding='utf-8', low_memory=False)
        except:
             df = pd.read_csv(file_to_read, encoding='shift_jis', low_memory=False)

    # Ensure columns exist
    if COL_TIKTOK_URL not in df.columns: df[COL_TIKTOK_URL] = None
    if COL_TIKTOK_FOLLOWERS not in df.columns: df[COL_TIKTOK_FOLLOWERS] = None

    # 3. Get Start Index
    start_index = 0
    try:
        val = input("Enter start row index (default 0): ")
        if val.strip() != "":
            start_index = int(val)
    except:
        start_index = 0

    # 2. Setup Driver
    driver = setup_driver()
    print("Driver connected successfully.")
    
    print(f"Starting scraping from row {start_index}... Press Ctrl+C to stop and save.")
    processed_count = 0
    save_interval = 10
    
    try:
        for idx, row in df.iterrows():
            if idx < start_index: continue

            company_name = row[COL_COMPANY_NAME]
            if pd.isna(company_name) or company_name == "": continue
            
            print(f"[{idx}] Processing: {company_name}")

            website_url = row.get('website_url', None)
            
            # --- UPDATE MODE LOGIC ---
            existing_url = row[COL_TIKTOK_URL]
            should_search = True

            if pd.notna(existing_url) and str(existing_url).strip() != "":
                e_url = str(existing_url).strip()
                print(f"  [Existing] Verifying: {e_url}")
                is_valid, followers, final_url = validate_tiktok_profile(driver, e_url, company_name, website_url)
                
                if is_valid:
                    print(f"  [UPDATE] Valid existing URL. Updating followers: {followers}")
                    df.at[idx, COL_TIKTOK_FOLLOWERS] = followers
                    df.at[idx, COL_TIKTOK_URL] = final_url 
                    should_search = False
                else:
                    print("  [Invalid] Existing URL failed validation. Will search for new one.")
            
            if should_search:
                # Search
                url = google_search_tiktok(driver, company_name)
                
                if url:
                    print(f"  Found URL: {url}")
                    # Validate
                    is_valid, followers, final_url = validate_tiktok_profile(driver, url, company_name, website_url)
                    
                    if is_valid:
                        print(f"  [SUCCESS] Set URL and Followers: {followers}")
                        df.at[idx, COL_TIKTOK_URL] = final_url
                        df.at[idx, COL_TIKTOK_FOLLOWERS] = followers
                    else:
                        print("  [Skipped] Validation failed.")
                else:
                    print("  [Not Found] No URL found via Google.")

            processed_count += 1
            if processed_count % save_interval == 0:
                print(f"Saving progress to {OUTPUT_FILE}...")
                df.to_csv(OUTPUT_FILE, index=False, encoding='cp932', errors='ignore')
                
    except KeyboardInterrupt:
        print("\nStopping...")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        print(f"Final save to {OUTPUT_FILE}...")
        df.to_csv(OUTPUT_FILE, index=False, encoding='cp932', errors='ignore')
        driver.quit()
        print("Done.")

if __name__ == "__main__":
    main()
