import pandas as pd
import time
import random
import os
import re
import unicodedata
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Configuration
INPUT_FILE = 'companies.csv'
OUTPUT_FILE = 'companies_x_updated.csv' # Separate output file for safety during test

def normalize_text(text):
    """Normalize text to NFKC (handles full-width/half-width) and strip spaces."""
    if not text: return ""
    return unicodedata.normalize('NFKC', str(text)).strip()

def normalize_company_name(name):
    """Removes common suffixes to get the core name for checking."""
    if not name: return ""
    name = normalize_text(name)
    name = name.replace("株式会社", "").replace("有限会社", "").replace("合同会社", "")
    name = name.replace("（株）", "").replace("(株)", "")
    return name.strip()

def parse_count_str(count_str):
    if not count_str: return 0
    s = str(count_str).upper().replace(',', '').replace(' ', '')
    multiplier = 1
    if 'K' in s:
        multiplier = 1000
        s = s.replace('K', '')
    elif 'M' in s:
        multiplier = 1000000
        s = s.replace('M', '')
    elif 'B' in s:
        multiplier = 1000000000
        s = s.replace('B', '')
    elif '万' in s:
        multiplier = 10000
        s = s.replace('万', '')
    
    nums = re.findall(r"[\d\.]+", s)
    if not nums: return 0
    return int(float(nums[0]) * multiplier)

def setup_driver():
    print("Connecting to existing Chrome on port 9225...")
    options = webdriver.ChromeOptions()
    options.add_experimental_option("debuggerAddress", "127.0.0.1:9225")
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        return driver
    except Exception as e:
        print(f"\nError connecting to Chrome: {e}")
        # Use a local path for the profile to ensure permissions
        cwd = os.getcwd()
        profile_path = os.path.join(cwd, "chrome_profile_2")
        print(f"Make sure you have started Chrome with: chrome.exe --remote-debugging-port=9225 --user-data-dir=\"{profile_path}\"")
        raise e

def get_x_candidates(driver, company_name):
    """Searches X for the company and returns candidate URLs, prioritizing 'Official'."""
    candidates = [] # List of (url, text)
    try:
        search_url = f"https://x.com/search?q={company_name}&f=user"
        driver.get(search_url)
        time.sleep(4) # Wait for results
        
        # Scrape User Cells with text for prioritization
        elements = driver.find_elements(By.CSS_SELECTOR, '[data-testid="UserCell"]')
        for el in elements:
            try:
                link = el.find_element(By.TAG_NAME, 'a').get_attribute('href')
                text = el.text
                if link and "/status/" not in link and "/search" not in link:
                    candidates.append((link, text))
            except: continue
        
        # Sort/Prioritize
        # 1. Contains "公式" (Official)
        official = [c[0] for c in candidates if "公式" in c[1]]
        # 2. Others
        others = [c[0] for c in candidates if "公式" not in c[1]]
        
        # Merge, verifying uniqueness
        final_list = []
        seen = set()
        for url in official + others:
            if url not in seen:
                final_list.append(url)
                seen.add(url)
                
        return final_list

    except Exception as e:
        print(f"  Search Error: {e}")
        return []

from urllib.parse import urlparse

def get_domain(url):
    """Extracts domain from URL (e.g. 'https://www.google.com/foo' -> 'google.com')."""
    if not url: return ""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc
        if domain.startswith("www."): domain = domain[4:]
        return domain
    except: return ""

def validate_x_profile(driver, url, company_name, expected_url):
    """
    Validates X profile:
    1. Check if profile contains a website link matching expected_url domain.
    2. Check if normalized company name exists in profile.
    3. Check if posts >= 10.
    Returns (True/False, follower_count)
    """
    try:
        driver.get(url)
        time.sleep(3)
        
        # 1. Domain Check (Strongest Signal)
        expected_domain = get_domain(expected_url) if expected_url and pd.notna(expected_url) else None
        profile_link_domain = None
        
        try:
            # Find the website link in profile (usually data-testid="UserUrl" or within header info)
            link_els = driver.find_elements(By.CSS_SELECTOR, '[data-testid="UserUrl"] a, [data-testid="UserProfileHeader_Url"] a')
            for el in link_els:
                href = el.get_attribute('href')
                # X redirects via t.co, but the text usually shows the display URL
                # Or we can resolve t.co, but usually the text 'google.com' is enough
                text = el.text
                if text:
                    profile_link_domain = text.replace("http://", "").replace("https://", "").split("/")[0].replace("www.", "")
                    if expected_domain and expected_domain in profile_link_domain:
                         print(f"      [CONFIRMED] Domain match: {expected_domain} in {profile_link_domain}")
                         # If domain matches, we are very confident.
                         # Still scrape stats though.
        except: pass

        page_text = normalize_text(driver.find_element(By.TAG_NAME, "body").text)
        core_name = normalize_company_name(company_name)
        
        # 2. Name Check
        name_match = False
        if core_name.lower() in page_text.lower(): name_match = True
        elif core_name.replace(" ", "") in page_text.replace(" ", ""): name_match = True
        
        if not name_match and not (expected_domain and profile_link_domain and expected_domain in profile_link_domain):
            print(f"      [Reject Name] '{core_name}' not found and no domain match.")
            return False, 0

        # If name matches but domain explicitly MISMATCHES significantly?
        # E.g. expected 'greenhouse.co.jp' but found 'green-house.co.jp'.
        if expected_domain and profile_link_domain and expected_domain not in profile_link_domain and profile_link_domain not in expected_domain:
             # Very specific risk for Green House
             print(f"      [Reject Domain] Mismatch: Expected {expected_domain}, Found {profile_link_domain}")
             return False, 0
        
        # 3. Extract Stats
        post_count = 0
        follower_count = 0
        
        p_match = re.search(r'([\d\.,BKkMm万]+)\s+(posts|Posts|件のポスト)', page_text)
        if p_match: post_count = parse_count_str(p_match.group(1))
        
        f_match = re.search(r'([\d\.,BKkMm万]+)\s*(Followers|followers|フォロワー)', page_text)
        if f_match: follower_count = parse_count_str(f_match.group(1))
        
        if post_count == 0:
            try:
                header_els = driver.find_elements(By.CSS_SELECTOR, '[data-testid="UserName"] col-2, [data-testid="primaryColumn"] h2 + div')
                for el in header_els:
                    if "post" in el.text.lower() or "ポスト" in el.text:
                         post_count = parse_count_str(el.text)
                         break
            except: pass

        print(f"      [Stats] Posts: ~{post_count}, Followers: ~{follower_count}")
        
        if post_count > 0 and post_count < 10:
            print(f"      [Reject] Post count {post_count} < 10")
            return False, 0
            
        return True, follower_count

    except Exception as e:
        print(f"      Validation Error: {e}")
        return False, 0

def main():
    if os.path.exists(OUTPUT_FILE):
        print(f"Resuming from {OUTPUT_FILE}")
        try: df = pd.read_csv(OUTPUT_FILE, encoding='utf-8', low_memory=False)
        except: df = pd.read_csv(OUTPUT_FILE, encoding='utf-8-sig', low_memory=False)
    else:
        if not os.path.exists(INPUT_FILE):
             print(f"Error: {INPUT_FILE} not found.")
             return
        try: df = pd.read_csv(INPUT_FILE, encoding='utf-8', low_memory=False)
        except:
             try: df = pd.read_csv(INPUT_FILE, encoding='cp932', low_memory=False)
             except: df = pd.read_csv(INPUT_FILE, encoding='shift_jis', low_memory=False)

    if 'x_url' not in df.columns: df['x_url'] = None
    if 'x_followers' not in df.columns: df['x_followers'] = None

    driver = setup_driver()
    print("Opening X login page...")
    driver.get("https://x.com/i/flow/login")
    input("Please log in to X in the browser, then press Enter to start scraping...")

    BATCH = 10
    processed = 0

    try:
        for idx, row in df.iterrows():
            cname = row['company_name']
            url_csv = row.get('website_url', None) # Get website from CSV
            
            if pd.isna(cname): continue
            if pd.notna(row['x_url']) and row['x_url'] != "": continue
            
            print(f"[{processed+1}] Searching X for: {cname} (URL: {url_csv})")
            
            candidates = get_x_candidates(driver, cname)
            found_url = None
            found_followers = 0
            
            for cand in candidates:
                print(f"    Checking: {cand}")
                # Pass CSV URL for validation
                valid, followers = validate_x_profile(driver, cand, cname, url_csv)
                if valid:
                    found_url = cand
                    found_followers = followers
                    break
            
            if found_url:
                print(f"    [MATCH] {found_url} ({found_followers} followers)")
                df.at[idx, 'x_url'] = found_url
                if found_followers > 0: df.at[idx, 'x_followers'] = found_followers
                df.to_csv(OUTPUT_FILE, index=False, encoding='utf-8-sig')
            else:
                print("    [None] No valid profile found.")
            
            processed += 1
            if processed % BATCH == 0:
                print(f"--- Processed {processed}. Saving progress... ---")
                df.to_csv(OUTPUT_FILE, index=False, encoding='utf-8-sig')
                
    except KeyboardInterrupt: print("\nStopping...")
    finally:
        df.to_csv(OUTPUT_FILE, index=False, encoding='utf-8-sig')
        driver.quit()
        print(f"Saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
