
import pandas as pd
import os

files = ['companies_x_updated.csv', 'companies.csv']
target_file = None

for f in files:
    if os.path.exists(f):
        target_file = f
        break

if not target_file:
    print("No CSV found")
    exit()

print(f"Reading {target_file}...")
try:
    df = pd.read_csv(target_file, encoding='utf-8', low_memory=False)
except:
    try:
        df = pd.read_csv(target_file, encoding='utf-8-sig', low_memory=False)
    except:
        df = pd.read_csv(target_file, encoding='cp932', low_memory=False)

total = len(df)
if 'x_url' not in df.columns:
    done = 0
else:
    done = df['x_url'].notna().sum()

print(f"Total: {total}")
print(f"Done: {done}")
print(f"Remaining: {total - done}")

# Get first 5 to do
to_do = df[df['x_url'].isna() | (df['x_url'] == '')]
print("Next 5 to scrape:")
print(to_do[['company_name', 'website_url']].head(5).to_dict('records'))
