import os
import time
import re
from supabase import create_client, Client
from duckduckgo_search import DDGS
from dotenv import load_dotenv

# Load local env if available
load_dotenv('.env.local')

# --- Config ---
SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

# Industries/Keywords to search for
KEYWORDS = [
    "東京都 IT企業 会社概要",
    "大阪府 製造業 会社概要",
    "福岡県 不動産 会社概要",
    "愛知県 運送業 会社概要"
]

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_KEY must be set.")
    # exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

def search_companies(query, max_results=20):
    print(f"Searching for: {query}")
    results = []
    try:
        with DDGS() as ddgs:
            # DuckDuckGo search
            search_gen = ddgs.text(query, max_results=max_results)
            for r in search_gen:
                results.append(r)
            time.sleep(2)
    except Exception as e:
        print(f"Search error: {e}")
    return results

def extract_company_info(result):
    """
    Heuristic to extract Company Name from Title.
    Title format is often "会社概要 | 株式会社ホゲホゲ" or "株式会社フガフガ - 企業情報"
    """
    title = result.get('title', '')
    url = result.get('href', '')
    
    # Simple extraction: look for typical company suffixes
    name_match = re.search(r'([^\s\|\|\-]+(?:株式会社|有限会社|合同会社)[^\s\|\|\-]+)', title)
    company_name = name_match.group(1) if name_match else None
    
    # Fallback: if title starts with the name
    if not company_name:
        parts = re.split(r'[\|\-]', title)
        if len(parts) > 0:
            candidate = parts[0].strip()
            if len(candidate) < 30 and ("株式会社" in candidate or "有限会社" in candidate):
                company_name = candidate

    return company_name, url

def insert_company(name, url):
    if not name or not url or not supabase: return
    
    # Check simple duplicate by URL or Name
    try:
        # Check URL
        existing = supabase.table("companies").select("id").eq("website_url", url).execute()
        if existing.data:
            print(f"  [Skip] URL exists: {name}")
            return

        # Insert
        print(f"  [NEW] Inserting: {name}")
        data = {
            "company_name": name,
            "website_url": url,
            "industry": "未分類", # Needs refinement or AI classification
            "region": "不明"      # Needs refinement
        }
        supabase.table("companies").insert(data).execute()
        
    except Exception as e:
        print(f"  [Error] Insert failed: {e}")

def main():
    print("Starting Company Discovery...")
    
    for kw in KEYWORDS:
        results = search_companies(kw)
        print(f"Found {len(results)} results for '{kw}'")
        
        for res in results:
            name, url = extract_company_info(res)
            if name and url:
                insert_company(name, url)
        
        time.sleep(5) # Respect rate limits

if __name__ == "__main__":
    main()
