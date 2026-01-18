import pandas as pd
import os

INPUT_FILE = 'companies.csv'

def main():
    if not os.path.exists(INPUT_FILE):
        print("File not found.")
        return

    try: df = pd.read_csv(INPUT_FILE, encoding='utf-8')
    except:
        try: df = pd.read_csv(INPUT_FILE, encoding='cp932')
        except: df = pd.read_csv(INPUT_FILE, encoding='shift_jis')
        
    # Filter IDs 2-10
    # Assuming 'id' column exists, or just index 1-9 (0-indexed)
    # The user said "ID 2~10". Let's print the first 15 rows to be sure of mapping.
    # Write to file
    with open('names_list.txt', 'w', encoding='utf-8') as f:
        # Check cols
        f.write(f"Columns: {list(df.columns)}\n")
        if 'website_url' in df.columns:
             for idx, row in df.head(10).iterrows():
                 f.write(f"{row.get('company_name')}: {row.get('website_url')}\n")
    print("Wrote to names_list.txt")

if __name__ == "__main__":
    main()
