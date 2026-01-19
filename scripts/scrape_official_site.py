import os
import re
import time
import requests
import unicodedata
from bs4 import BeautifulSoup
from supabase import create_client, Client
from urllib.parse import urljoin
from dotenv import load_dotenv
from googlesearch import search

# Requires: pip install requests beautifulsoup4 supabase python-dotenv googlesearch-python

# Load local env
load_dotenv('.env.local')

# --- Config ---
SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
BATCH_SIZE = 50

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_KEY must be set.")

# Initialize Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

def normalize_text(text):
    if not text: return ""
    return unicodedata.normalize('NFKC', str(text)).strip().lower()

def get_companies_to_process():
    if not supabase: return []
    response = supabase.table("companies").select("*").not_.is_("website_url", "null").limit(BATCH_SIZE).execute()
    return response.data

def validate_sns_page(url, company_name):
    """
    Simple validation: Check if company name exists in the SNS page title or description.
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    try:
        res = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(res.text, 'html.parser')
        text_content = (soup.title.string if soup.title else "") + " " + (soup.find('meta', attrs={'name': 'description'}) or {}).get('content', '')
        
        norm_name = normalize_text(company_name)
        norm_text = normalize_text(text_content)
        
        if norm_name in norm_text:
            return True
        return False
    except:
        return False

def search_sns_fallback(company_name, platform_domain):
    """
    Search for company SNS using Google Search.
    """
    query = f"{company_name} {platform_domain}"
    print(f"  [Fallback] Searching Google: {query}")
    try:
        # googlesearch.search(query, num_results=N, advanced=True) returns objects with .url, .title, .description
        # sleep_interval is important to avoid 429 errors
        results = search(query, num_results=3, advanced=True, sleep_interval=5)
        
        for r in results:
            href = r.url
            if platform_domain in href:
                # Basic exclusion
                if '/p/' in href or '/explore/' in href or '/video/' in href or '/watch' in href:
                    continue
                return href
    except Exception as e:
        print(f"  [Search Error] {e}")
    return None

def find_sns_links(website_url, company_name):
    """
    1. Scrapes homepage.
    2. If missing, searches fallback.
    """
    sns_links = {}
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    # 1. Direct Website Scraping
    try:
        print(f"Scraping Official Site: {website_url}")
        res = requests.get(website_url, headers=headers, timeout=10)
        soup = BeautifulSoup(res.text, 'html.parser')
        
        for a in soup.find_all('a', href=True):
            href = a['href']
            full_url = urljoin(website_url, href)
            
            if not sns_links.get('instagram') and 'instagram.com' in full_url:
                if '/p/' not in full_url and '/explore/' not in full_url:
                    sns_links['instagram'] = full_url
            
            if not sns_links.get('tiktok') and 'tiktok.com' in full_url:
                if '/video/' not in full_url:
                    sns_links['tiktok'] = full_url
                    
            if not sns_links.get('youtube') and ('youtube.com' in full_url or 'youtu.be' in full_url):
                if '/watch' not in full_url:
                    sns_links['youtube'] = full_url

    except Exception as e:
        print(f"Error scraping {website_url}: {e}")

    # 2. Fallback Search (Only if missing)
    platforms = [
        ('instagram', 'instagram.com'),
        ('tiktok', 'tiktok.com'),
        ('youtube', 'youtube.com')
    ]
    
    for key, domain in platforms:
        if not sns_links.get(key):
            found_url = search_sns_fallback(company_name, domain)
            if found_url:
                # Validate
                if validate_sns_page(found_url, company_name):
                    print(f"  [Fallback Success] Found {key}: {found_url}")
                    sns_links[key] = found_url
                else:
                    print(f"  [Fallback Reject] Validation failed for {found_url}")

    return sns_links

def update_company(company_id, sns_data):
    """Updates Supabase with found links."""
    if not sns_data or not supabase: return
    
    update_payload = {}
    # ONLY add to payload if we have a value.
    # If sns_data['instagram'] is None/Empty, we do NOT add it to payload.
    # This prevents overwriting existing data with null.
    
    if sns_data.get('instagram'): update_payload['insta_url'] = sns_data['instagram']
    if sns_data.get('tiktok'): update_payload['tiktok_url'] = sns_data['tiktok']
    if sns_data.get('youtube'): update_payload['youtube_url'] = sns_data['youtube']
    
    if update_payload:
        print(f"Updating {company_id}: {update_payload}")
        supabase.table("companies").update(update_payload).eq("id", company_id).execute()

def main():
    print("Starting Official Site Scan (w/ Fallback)...")
    companies = get_companies_to_process()
    print(f"Found {len(companies)} companies to process.")
    
    for company in companies:
        url = company.get('website_url')
        name = company.get('company_name')
        if not url or not name: continue
        
        links = find_sns_links(url, name)
        if links:
            update_company(company['id'], links)
        
        time.sleep(1)

if __name__ == "__main__":
    main()
