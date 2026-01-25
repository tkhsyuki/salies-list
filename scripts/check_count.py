import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv('.env.local')

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: credentials missing")
    exit()

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

try:
    # Use count='exact', head=True to just get count
    res = supabase.table('companies').select('*', count='exact', head=True).execute()
    print(f"Total count (exact): {res.count}")
except Exception as e:
    print(e)
