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
OUTPUT_FILE = 'companies_instagram_filled.csv'
# If you want to continue from the output file (resume mode), set this to True
RESUME_FROM_OUTPUT = True

# Column names in CSV
COL_COMPANY_NAME = 'company_name'
COL_INSTA_URL = 'insta_url'
COL_INSTA_FOLLOWERS = 'insta_followers'

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
    print("Connecting to existing Chrome on port 9225...")
    options = webdriver.ChromeOptions()
    options.add_experimental_option("debuggerAddress", "127.0.0.1:9225")
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        # Set a reasonable page load timeout to prevent hanging
        driver.set_page_load_timeout(20) 
        return driver
    except Exception as e:
        print(f"\nError connecting to Chrome: {e}")
        print("IMPORTANT: You must start Chrome with remote debugging first!")
        print('Run this in Command Prompt: chrome.exe --remote-debugging-port=9225 --user-data-dir="C:\\selenium\\ChromeProfile_Instagram"')
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

def google_search_instagram(driver, company_name):
    """Searches Google for '{company_name} instagram' and returns the first IG result."""
    try:
        query = f"{company_name} instagram"
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
        
        # Find first result that goes to instagram.com
        # Excluding ads? Google ads usually have diff structure.
        # Standard results are usually in 'h3' parent 'a'
        
        results = driver.find_elements(By.XPATH, '//a[contains(@href, "instagram.com/")]')
        
        for res in results:
            url = res.get_attribute('href')
            if "/p/" in url: continue # Skip posts
            if "/explore/" in url: continue
            if "/reel/" in url: continue
            return url
            
    except Exception as e:
        print(f"  [Error] Google Search failed: {e}")
        
    return None

def validate_instagram_profile(driver, url, company_name, website_url=None):
    """
    Visits the URL, checks if the name matches loosely, scrapes followers/posts.
    Returns: (is_valid, followers_count, correct_url)
    """
    try:
        safe_get(driver, url)
        time.sleep(3)
        
        # 1. Extract Stats (Followers & Posts)
        followers = 0
        posts = 0
        
        # Strategy A: Meta Description (Fastest)
        try:
            meta_elem = driver.find_element(By.CSS_SELECTOR, 'meta[name="description"]')
            if not meta_elem: meta_elem = driver.find_element(By.CSS_SELECTOR, 'meta[property="og:description"]')
            
            if meta_elem:
                meta = meta_elem.get_attribute("content")
                # Extract followers
                f_match = re.search(r'([\d\.,BKkMm万]+)\s*(Followers|followers|フォロワー)', meta)
                if f_match: followers = parse_count_str(f_match.group(1))
                # Extract posts
                p_match = re.search(r'([\d\.,BKkMm万]+)\s*(Posts|posts|件|ツイート|videos|本)', meta)
                if p_match: posts = parse_count_str(p_match.group(1))
                print(f"  [Meta Stats] Followers: {followers}, Posts: {posts}")
        except: pass

        # Strategy B: DOM Parsing (HTML Structure based on user feedback)
        # Look for elements with title="X.X万" or similar patterns if meta failed or returned 0
        if followers == 0:
            try:
                # 1. Search for links containing "followers" (best practice usually)
                # Broader search: "followers" in href, not just "/followers"
                follower_links = driver.find_elements(By.XPATH, '//a[contains(@href, "followers")]')
                
                for link in follower_links:
                    # Debug: print link info
                    try:
                        href_val = link.get_attribute('href')
                        text_val = link.text.replace("\n", " ").strip()
                        print(f"    [Debug] Found followers link: {href_val} | Text: {text_val}")
                    except: pass
                    
                    # A. Check for 'title' attribute in any child (Most reliable for exact numbers like 1744 or 1.4万)
                    try:
                        # Find ANY child with a title attribute
                        titulars = link.find_elements(By.XPATH, './/*[@title]')
                        for t in titulars:
                            t_val = t.get_attribute('title')
                            print(f"      [Debug] Child title: {t_val}")
                            val = parse_count_str(t_val)
                            if val > 0:
                                followers = val
                                print(f"  [DOM Title] Followers from child title: {followers}")
                                break
                    except: pass
                    if followers > 0: break

                    # B. Check for text content if title failed
                    # Since "フォロワー" might be in ::before, the text might just be "1744" or "1744 人"
                    if followers == 0:
                        # Try to find the number in the text
                        # It might be "1,744" or "1.4万"
                        # We just look for the first number-like pattern
                        import re # ensure re is available
                        f_dom = parse_count_str(text_val)
                        if f_dom > 0:
                            followers = f_dom
                            print(f"  [DOM Text] Followers from link text: {followers}")
                            break
                            
                # 2. Fallback: Search for any span with a title attribute acting like a count if link search failed
                if followers == 0:
                    titles = driver.find_elements(By.CSS_SELECTOR, 'span[title]')
                    for t in titles:
                        val = t.get_attribute('title')
                        if re.match(r'^[\d\.,]+[万BKkMm]?$', val):
                            # Check ancestors for "followers" link even if we missed it before?
                            # Or check sibling text.
                            try:
                                parent = t.find_element(By.XPATH, './..')
                                # Check if parent is a link to followers
                                p_href = parent.get_attribute('href')
                                if p_href and "followers" in p_href:
                                     followers = parse_count_str(val)
                                     print(f"  [DOM Scan] Found title {val} inside followers link.")
                                     break
                            except: pass
            except Exception as e:
                print(f"  [DOM Error] {e}")

        # 2. Validation Rules
        page_text = driver.find_element(By.TAG_NAME, "body").text
        core_name = normalize_company_name(company_name)
        
        # Name Validation: exact match of core name OR contains "公式" (Official) OR Website Domain Match
        name_match = core_name.lower().replace(" ", "") in page_text.lower().replace(" ", "")
        official_match = "公式" in page_text or "official" in page_text.lower()
        
        website_match = False
        if website_url and isinstance(website_url, str):
            # Simple domain extraction: "https://www.example.com/foo" -> "example.com"
            try:
                # Remove protocol
                d = re.sub(r'^https?://', '', website_url)
                # Remove www.
                d = re.sub(r'^www\.', '', d)
                # Remove path
                d = d.split('/')[0]
                
                if d and len(d) > 4: # basic sanity check, ignore short "t.co" styled potential noise if logic was different, but safely >3 chars
                    if d.lower() in page_text.lower():
                         website_match = True
                         print(f"  [Match] Website domain '{d}' found in profile.")
            except: pass

        if not (name_match or official_match or website_match):
             print(f"  [Reject] Name '{core_name}' not found, 'official' not found, and website match failed.")
             return False, 0, url

        # Post Count Validation (New Threshold: 5)
        # If we couldn't find post count, we might be lenient if name check passed strongly?
        # But user requested "Post count 5+ condition". 
        if posts > 0 and posts < 5:
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
        df = pd.read_csv(file_to_read, encoding='cp932') # Try Shift-JIS/CP932 first for Japanese CSVs
    except:
        try:
             df = pd.read_csv(file_to_read, encoding='utf-8')
        except:
             df = pd.read_csv(file_to_read, encoding='shift_jis')

    # Ensure columns exist
    if COL_INSTA_URL not in df.columns: df[COL_INSTA_URL] = None
    if COL_INSTA_FOLLOWERS not in df.columns: df[COL_INSTA_FOLLOWERS] = None

    # 2. Setup Driver
    driver = setup_driver()

    # 3. Get Start Index
    start_index = 0
    try:
        val = input("Enter start row index (default 0): ")
        if val.strip() != "":
            start_index = int(val)
    except:
        start_index = 0
    
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
            # If we already have a URL, verify it first instead of skipping
            existing_url = row[COL_INSTA_URL]
            should_search = True

            if pd.notna(existing_url) and str(existing_url).strip() != "":
                e_url = str(existing_url).strip()
                print(f"  [Existing] Verifying: {e_url}")
                is_valid, followers, final_url = validate_instagram_profile(driver, e_url, company_name, website_url)
                
                if is_valid:
                    print(f"  [UPDATE] Valid existing URL. Updating followers: {followers}")
                    df.at[idx, COL_INSTA_FOLLOWERS] = followers
                    # Ensure format is clean
                    df.at[idx, COL_INSTA_URL] = final_url 
                    should_search = False
                else:
                    print("  [Invalid] Existing URL failed validation. Will search for new one.")
            
            if should_search:
                # Search
                url = google_search_instagram(driver, company_name)
                
                if url:
                    print(f"  Found URL: {url}")
                    # Validate
                    is_valid, followers, final_url = validate_instagram_profile(driver, url, company_name, website_url)
                    
                    if is_valid:
                        print(f"  [SUCCESS] Set URL and Followers: {followers}")
                        df.at[idx, COL_INSTA_URL] = final_url
                        df.at[idx, COL_INSTA_FOLLOWERS] = followers
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
