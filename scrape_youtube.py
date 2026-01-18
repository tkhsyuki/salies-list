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
OUTPUT_FILE = 'companies_youtube_filled.csv'
# If you want to continue from the output file (resume mode), set this to True
RESUME_FROM_OUTPUT = True

# Column names in CSV
COL_COMPANY_NAME = 'company_name'
COL_YOUTUBE_URL = 'youtube_url'
COL_YOUTUBE_SUBS = 'youtube_subscribers'

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
    # Remove common labels from the string before parsing numbers
    s = re.sub(r'(チャンネル登録者数|subscribers|登録者)', '', s).strip()
    
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
    elif '億' in s:
        multiplier = 100000000
        s = s.replace('億', '')

    try:
        val = float(re.findall(r"[\d\.]+", s)[0])
        return int(val * multiplier)
    except:
        return 0

def setup_driver():
    print("Connecting to existing Chrome on port 9227...")
    options = webdriver.ChromeOptions()
    options.add_experimental_option("debuggerAddress", "127.0.0.1:9227")
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        # Set a reasonable page load timeout to prevent hanging
        driver.set_page_load_timeout(20) 
        return driver
    except Exception as e:
        print(f"\nError connecting to Chrome: {e}")
        print("IMPORTANT: You must start Chrome with remote debugging first!")
        print('Run this in Command Prompt: chrome.exe --remote-debugging-port=9227 --user-data-dir="C:\\selenium\\ChromeProfile_YouTube"')
        raise e

def safe_get(driver, url):
    """
    Tries to load a page. If it times out, stops loading but keeps the open page.
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

def google_search_youtube(driver, company_name):
    """Searches Google for '{company_name} youtube' and returns the first channel/user URL."""
    try:
        query = f"{company_name} youtube"
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
        
        # Find first result that goes to youtube.com
        results = driver.find_elements(By.XPATH, '//a[contains(@href, "youtube.com")]')
        
        for res in results:
            url = res.get_attribute('href')
            if not url: continue
            
            # Identify channel URLs
            # Typical patterns:
            # https://www.youtube.com/channel/UC...
            # https://www.youtube.com/c/Name
            # https://www.youtube.com/user/Name
            # https://www.youtube.com/@Handle
            
            if "/watch" in url: continue
            if "/playlist" in url: continue
            if "/results" in url: continue
            
            # Must look like a channel
            if "/channel/" in url or "/c/" in url or "/user/" in url or "/@" in url:
                return url

    except Exception as e:
        print(f"  [Error] Google Search failed: {e}")
        
    return None

def validate_youtube_profile(driver, url, company_name, website_url=None):
    """
    Visits the URL, checks if the name matches loosely, scrapes subscribers.
    Returns: (is_valid, subscribers_count, correct_url)
    """
    try:
        safe_get(driver, url)
        time.sleep(3)
        
        subs = 0
        
        # 1. Extract Stats using DOM (based on user feedback)
        # Look for text "チャンネル登録者数" (subscribers)
        try:
            # Try finding the specific span class or just contains text
            # Youtube structure changes, but searching by text is robust for language specific
            # "15.7万人" might be in a span with 'id="subscriber-count"' or similar id/class in some versions, 
            # but user showed: <span class="yt-core-attributed-string ...">チャンネル登録者数 15.7万人</span>
            
            # Using xpath to find element containing "登録者" or "subscribers"
            sub_elems = driver.find_elements(By.XPATH, '//*[contains(text(), "登録者") or contains(text(), "subscribers")]')
            
            for el in sub_elems:
                text = el.text
                if not text: continue
                # Parse: "チャンネル登録者数 1.57万人" -> 15700
                if any(c.isdigit() for c in text): # must have numbers
                    val = parse_count_str(text)
                    if val > 0:
                        subs = val
                        print(f"  [DOM] Found subscribers: {text} -> {subs}")
                        break
        except Exception as e:
            print(f"  [DOM Error] {e}")

        # Fallback to meta description
        if subs == 0:
            try:
                 meta_elem = driver.find_element(By.CSS_SELECTOR, 'meta[name="description"]')
                 meta = meta_elem.get_attribute("content")
                 # Extract subs
                 f_match = re.search(r'([\d\.,BKkMm万億]+)\s*(subscribers|登録者)', meta)
                 if f_match: subs = parse_count_str(f_match.group(1))
                 print(f"  [Meta Stats] Subscribers: {subs}")
            except: pass

        # 2. Validation Rules
        try:
            page_text = driver.find_element(By.TAG_NAME, "body").text
        except:
             page_text = ""
             
        core_name = normalize_company_name(company_name)
        
        # Name Validation: exact match of core name OR contains "公式" (Official) OR Website Domain Match
        # For YouTube, channel name is usually in #channel-name or h1
        # We search whole body text just like other scripts
        name_match = core_name.lower().replace(" ", "") in page_text.lower().replace(" ", "")
        official_match = "公式" in page_text or "Official" in page_text or "official" in page_text.lower()
        
        website_match = False
        if website_url and isinstance(website_url, str):
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

        # YouTube specific "Post Count" check?
        # Videos count is harder to parse reliably from header text sometimes, but standard view often shows "1.2K videos"
        # We can try to parse video count, but the request emphasized following Instagram/TikTok conditions.
        # Those had "minimum 5 posts".
        # Let's try to find video count.
        videos = 0
        try:
            # "2.3K 本の動画" or "2.3K videos"
            v_elems = driver.find_elements(By.XPATH, '//*[contains(text(), "本の動画") or contains(text(), "videos")]')
            for el in v_elems:
                text = el.text
                # Filter out "Videos" tab text or unrelated
                # usually it's next to subscriber count line
                if any(c.isdigit() for c in text):
                     v_val = parse_count_str(text) # reusing same parser roughly works
                     if v_val > 0:
                         videos = v_val
                         print(f"  [DOM] Found video count: {text} -> {videos}")
                         break
        except: pass
        
        if videos > 0 and videos < 1:
             print(f"  [Reject] Low video count: {videos} < 1")
             return False, 0, url
        
        # If videos count failed to parse, we might default to accept if other conditions pass strongly.
        # Strict logic:
        # if videos == 0 and not (name_match and official_match): ...
        
        return True, subs, url

    except Exception as e:
        print(f"  [Error] Validation failed: {e}")
        return False, 0, url

# --- Main Loop ---

def main():
    # 3. Get Start Index (Prompt BEFORE driver)
    start_index = 0
    try:
        val = input("Enter start row index (default 0): ")
        if val.strip() != "":
            start_index = int(val)
    except:
        start_index = 0

    # 1. Load Data
    file_to_read = INPUT_FILE
    if RESUME_FROM_OUTPUT and os.path.exists(OUTPUT_FILE):
        print(f"Resuming from {OUTPUT_FILE}...")
        file_to_read = OUTPUT_FILE
    
    print(f"Reading {file_to_read}...")
    try:
        df = pd.read_csv(file_to_read, encoding='cp932', low_memory=False)
    except:
        try:
             df = pd.read_csv(file_to_read, encoding='utf-8', low_memory=False)
        except:
             df = pd.read_csv(file_to_read, encoding='shift_jis', low_memory=False)

    # Ensure columns exist
    if COL_YOUTUBE_URL not in df.columns: df[COL_YOUTUBE_URL] = None
    if COL_YOUTUBE_SUBS not in df.columns: df[COL_YOUTUBE_SUBS] = None

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
            existing_url = row[COL_YOUTUBE_URL]
            should_search = True

            if pd.notna(existing_url) and str(existing_url).strip() != "":
                e_url = str(existing_url).strip()
                print(f"  [Existing] Verifying: {e_url}")
                is_valid, subs, final_url = validate_youtube_profile(driver, e_url, company_name, website_url)
                
                if is_valid:
                    print(f"  [UPDATE] Valid existing URL. Updating subs: {subs}")
                    df.at[idx, COL_YOUTUBE_SUBS] = subs
                    df.at[idx, COL_YOUTUBE_URL] = final_url 
                    should_search = False
                else:
                    print("  [Invalid] Existing URL failed validation. Will search for new one.")
            
            if should_search:
                # Search
                url = google_search_youtube(driver, company_name)
                
                if url:
                    print(f"  Found URL: {url}")
                    # Validate
                    is_valid, subs, final_url = validate_youtube_profile(driver, url, company_name, website_url)
                    
                    if is_valid:
                        print(f"  [SUCCESS] Set URL and Subscribers: {subs}")
                        df.at[idx, COL_YOUTUBE_URL] = final_url
                        df.at[idx, COL_YOUTUBE_SUBS] = subs
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
