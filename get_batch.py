
import pandas as pd
import json

try: df = pd.read_csv('companies_x_updated.csv', encoding='utf-8', low_memory=False)
except: 
    try: df = pd.read_csv('companies_x_updated.csv', encoding='utf-8-sig', low_memory=False)
    except: df = pd.read_csv('companies.csv', encoding='utf-8', low_memory=False)

target = df[df['x_url'].isna() | (df['x_url'] == '')].head(5)

result = []
for _, row in target.iterrows():
    result.append({
        'name': row['company_name'],
        'website': row['website_url']
    })

with open('batch.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)
