import pandas as pd
import time
import random
import os
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Configuration
INPUT_FILE = 'companies.csv'
OUTPUT_FILE = 'companies_updated.csv'

# Excluding validation/name logic from config, simplifying
SNS_PLATFORMS = {
    'X (Twitter)': {'col_url': 'x_url', 'col_follow': 'x_followers', 'domain': 'twitter.com'},
    'Instagram': {'col_url': 'insta_url', 'col_follow': 'insta_followers', 'domain': 'instagram.com'},
    'TikTok': {'col_url': 'tiktok_url', 'col_follow': 'tiktok_followers', 'domain': 'tiktok.com'},
    'YouTube': {'col_url': 'youtube_url', 'col_follow': 'youtube_subscribers', 'domain': 'youtube.com'},
    # 'LINE': {'col_url': 'line_url', 'col_follow': 'line_friends', 'domain': 'line.me'} # User didn't prioritize LINE recently, but keeping if needed or skipping per request "Target X, instagram, tiktok, Youtube"
}

def setup_driver():
    print("Connecting to existing Chrome on port 9222...")
    options = webdriver.ChromeOptions()
    options.add_experimental_option("debuggerAddress", "127.0.0.1:9222")
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        return driver
    except Exception as e:
        print(f"\nError connecting to Chrome: {e}")
        print("Make sure you have started Chrome with: chrome.exe --remote-debugging-port=9222 --user-data-dir=\"C:\\selenium\\ChromeProfile\"")
        raise e

def open_login_pages(driver):
    urls = [
        "https://x.com/i/flow/login",
        "https://www.instagram.com/accounts/login/",
        "https://www.tiktok.com/login",
        "https://www.youtube.com/account",
    ]
    print("Opening SNS login pages...")
    for i, url in enumerate(urls):
        if i == 0: driver.get(url)
        else: driver.execute_script(f"window.open('{url}', '_blank');")
    
    print("\n" + "="*50)
    print("PLEASE LOG IN TO ALL SNS ACCOUNTS NOW.")
    print("="*50 + "\n")

import unicodedata

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

def search_instagram_ui(driver, company_name):
    """Interacts with IG sidebar search to find candidates."""
    candidates = []
    try:
        # Check if we are already on a search result page or just open search
        if "instagram.com" not in driver.current_url:
            driver.get("https://www.instagram.com/")
            time.sleep(3)
            
        # 1. Click Search Icon (Search for aria-label "Search" or "検索")
        try:
            search_btns = driver.find_elements(By.CSS_SELECTOR, 'svg[aria-label="Search"], svg[aria-label="検索"]')
            if search_btns:
                # Click the parent link/div
                search_btns[0].find_element(By.XPATH, "./../../..").click()
                time.sleep(1)
            else:
                 # If sidebar is not found/collapsed, maybe we are already in search mode?
                 # Try finding input directly
                 pass
        except: pass
        
        # 2. Type query
        try:
            search_input = WebDriverWait(driver, 5).until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, 'input[aria-label="Search input"], input[placeholder="Search"], input[placeholder="検索"]'))
            )
            search_input.clear()
            search_input.send_keys(company_name)
            time.sleep(1)
            # IMPORTANT: IG Results often appear dynamically. One might need to hit Enter or just wait.
            # Hitting Enter often goes to the first result or "See all results" page.
            # Let's try waiting for the results list in the drawer.
            time.sleep(4) 
        except Exception as e:
            print(f"    IG Search Input Error: {e}")
            return []

        # 3. Scrape results from the drawer
        # The container usually has role="listbox" or just look for 'a' tags in the visible side drawer
        # IG's sidebar drawer usually overlays.
        links = driver.find_elements(By.XPATH, '//a[contains(@href, "/")]')
        
        # Filter for profile-like links (no /explore/, /reels/ etc)
        # We need to rely on the fact that search results are usually at the top of the z-index or in a specific container.
        # A simple heuristic: check links that contain the company name (normalized) or look "user-like".
        
        found_count = 0
        for a in links:
             href = a.get_attribute('href')
             if not href or "instagram.com" not in href: continue
             
             path = href.split("instagram.com/")[-1].strip("/")
             if path in ["", "explore", "reels", "direct", "stories", "accounts"]: continue
             
             # Avoid "See all results" links if they look weird
             
             candidates.append(href)
             found_count += 1
             if found_count >= 5: break
            
        return list(set(candidates))

    except Exception as e:
        print(f"    IG Search UI Error: {e}")
    return []

def validate_profile(driver, url, sns_name, company_name):
    """
    Checks if profile checks name and post count.
    Returns (True/False, follower_count)
    """
    try:
        driver.get(url)
        time.sleep(3)
        page_text = normalize_text(driver.find_element(By.TAG_NAME, "body").text)
        core_name = normalize_company_name(company_name)
        
        # 1. Name Check (NFKC Normalized)
        if core_name.lower() not in page_text.lower():
            # Try removing spaces from both
            if core_name.replace(" ", "") not in page_text.replace(" ", ""):
                print(f"      [Reject Name] '{core_name}' not found.")
                return False, 0
            
        # 2. Extract Stats
        post_count = 0
        follower_count = 0
        
        # Helper to extract numbers from title/meta first as they are more reliable
        try:
             title = driver.title
             # Title format often: "Name (@handle) • Instagram photos and videos"
             # Meta description often has stats
             meta = driver.find_elements(By.CSS_SELECTOR, 'meta[name="description"], meta[property="og:description"]')
             if meta:
                 desc = meta[0].get_attribute('content')
                 desc_norm = normalize_text(desc)
                 print(f"      [Meta] {desc_norm}")
                 
                 # Pattern: "10K Followers, 10 Following, 20 Posts"
                 # Japanese: "フォロワー1万人、フォロー中10人、投稿20件"
                 
                 # Followers
                 f_match = re.search(r'([\d\.,BKkMm万]+)\s*(Followers|followers|フォロワー)', desc_norm)
                 if f_match: follower_count = parse_count_str(f_match.group(1))
                 
                 # Posts
                 p_match = re.search(r'([\d\.,BKkMm万]+)\s*(Posts|posts|件|ツイート|videos|本)', desc_norm)
                 if p_match: post_count = parse_count_str(p_match.group(1))
                 
                 # YouTube special handling if not in meta well
                 if sns_name == 'YouTube' and "subscribers" in desc_norm:
                      s_match = re.search(r'([\d\.,BKkMm万]+)\s*(subscribers|チャンネル登録者数)', desc_norm)
                      if s_match: follower_count = parse_count_str(s_match.group(1))

        except: pass

        # Fallback to page text scraping if meta failed
        if follower_count == 0 or post_count == 0:
            if sns_name == 'X (Twitter)':
                 # Try X specific
                 try: 
                     # Look for "Followers" text element previous sibling
                     # or aria-label
                     pass
                 except: pass
            
            # Simple Regex on Body
            if follower_count == 0:
                f_s = re.search(r'([\d\.,BKkMm万]+)\s*(Followers|followers|フォロワー)', page_text)
                if f_s: follower_count = parse_count_str(f_s.group(1))
            
            if post_count == 0:
                p_s = re.search(r'([\d\.,BKkMm万]+)\s*(Posts|posts|件|ツイート|videos|本)', page_text)
                if p_s: post_count = parse_count_str(p_s.group(1))

        print(f"      [Stats] Posts: {post_count}, Followers: {follower_count}")
        
        # 3. Post Count Check
        if post_count > 0 and post_count < 10:
             print(f"      [Reject Posts] {post_count} < 10")
             return False, 0

        if post_count == 0:
            print("      [Warn] Could not verify post count. Accepting based on name.")
        
        return True, follower_count

    except Exception as e:
        print(f"      Error validating: {e}")
        return False, 0

def main():
    if os.path.exists(OUTPUT_FILE):
        try: df = pd.read_csv(OUTPUT_FILE, encoding='utf-8')
        except: df = pd.read_csv(OUTPUT_FILE, encoding='utf-8-sig')
    else:
        if not os.path.exists(INPUT_FILE): return
        try: df = pd.read_csv(INPUT_FILE, encoding='utf-8')
        except:
             try: df = pd.read_csv(INPUT_FILE, encoding='cp932')
             except: df = pd.read_csv(INPUT_FILE, encoding='shift_jis')

    # Init cols
    for sns, cols in SNS_PLATFORMS.items():
        if cols['col_url'] not in df.columns: df[cols['col_url']] = None
        if cols['col_follow'] not in df.columns: df[cols['col_follow']] = None

    driver = setup_driver()
    open_login_pages(driver)
    
    print("Batch mode: Pause after 10.")
    input("Press Enter to start...")

    BATCH = 10
    processed = 0

    try:
        for idx, row in df.iterrows():
            cname = row['company_name']
            if pd.isna(cname): continue
            
            print(f"[{processed+1}] {cname}")
            save = False
            
            for sns, cfg in SNS_PLATFORMS.items():
                col_url = cfg['col_url']
                col_fol = cfg['col_follow']
                
                if pd.notna(row[col_url]) and row[col_url] != "": continue
                
                print(f"  > {sns}")
                candidates = []
                
                # 1. Search
                if sns == 'Instagram':
                    candidates = search_instagram_ui(driver, cname)
                else:
                    # URL Navigation Search
                    if sns == 'X (Twitter)':
                        driver.get(f"https://x.com/search?q={cname}&f=user")
                    elif sns == 'YouTube':
                        driver.get(f"https://www.youtube.com/results?search_query={cname}&sp=EgIQAg%253D%253D")
                    elif sns == 'TikTok':
                        driver.get(f"https://www.tiktok.com/search/user?q={cname}")
                    
                    time.sleep(3)
                    candidates = get_candidates_from_page(driver, sns)

                # 2. Validate Selection
                # Improve: Prioritize 'correct-looking' URLs or check all until one passes
                found_url = None
                found_followers = 0
                
                for cand in candidates:
                    print(f"    Checking: {cand}")
                    valid, followers = validate_profile(driver, cand, sns, cname)
                    if valid:
                        found_url = cand
                        found_followers = followers
                        break # Found match
                
                if found_url:
                    print(f"    [MATCH] {found_url} ({found_followers} followers)")
                    df.at[idx, col_url] = found_url
                    if found_followers > 0: df.at[idx, col_fol] = found_followers
                    save = True
                else:
                    print("    [None] No valid profile found.")
            
            if save: df.to_csv(OUTPUT_FILE, index=False, encoding='utf-8-sig')
            
            processed += 1
            if processed % BATCH == 0:
                print(f"--- {processed} Done ---")
                input("Press Enter...")
                
    except KeyboardInterrupt:
        print("Stopping.")
    finally:
        df.to_csv(OUTPUT_FILE, index=False, encoding='utf-8-sig')
        driver.quit()

if __name__ == "__main__":
    main()
