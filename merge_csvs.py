import pandas as pd
import os

# Configuration
BASE_FILE = 'companies.csv'
FILES_TO_MERGE = [
    {'file': 'companies_instagram_filled.csv', 'cols': ['insta_url', 'insta_followers']},
    {'file': 'companies_tiktok_filled.csv', 'cols': ['tiktok_url', 'tiktok_followers']},
    {'file': 'companies_youtube_filled.csv', 'cols': ['youtube_url', 'youtube_subscribers']}
]
OUTPUT_FILE = 'companies_final.csv'

def main():
    print(f"Loading base file: {BASE_FILE}...")
    try:
        base_df = pd.read_csv(BASE_FILE, encoding='cp932', low_memory=False)
    except:
        try:
             base_df = pd.read_csv(BASE_FILE, encoding='utf-8', low_memory=False)
        except:
             base_df = pd.read_csv(BASE_FILE, encoding='shift_jis', low_memory=False)

    print(f"Base rows: {len(base_df)}")
    
    # Create valid columns in base if not exist (initialize with None)
    for f in FILES_TO_MERGE:
        for col in f['cols']:
            if col not in base_df.columns:
                base_df[col] = None

    # Merge Process
    for item in FILES_TO_MERGE:
        filepath = item['file']
        cols = item['cols']
        
        if not os.path.exists(filepath):
            print(f"Warning: {filepath} not found. Skipping.")
            continue
            
        print(f"Merging {filepath}...")
        try:
            target_df = pd.read_csv(filepath, encoding='cp932', low_memory=False)
        except:
             try: target_df = pd.read_csv(filepath, encoding='utf-8', low_memory=False)
             except: target_df = pd.read_csv(filepath, encoding='shift_jis', low_memory=False)
        
        # We merge based on 'company_name'. 
        # Assuming company_name is unique enough or index helps.
        # Actually, best approach is to iterate and update base_df where company_name matches,
        # OR left join. 
        # Since these are filled versions of the SAME original csv, the company_name should align.
        
        # Create a dictionary for faster lookup? or just merge using pandas
        # We only want to update specific columns.
        
        # Let's subset target_df to just company_name + target cols
        # Ensure company_name exists
        if 'company_name' not in target_df.columns:
             print(f"Error: 'company_name' not in {filepath}. Skipping.")
             continue
             
        subset = target_df[['company_name'] + cols].copy()
        
        # Drop rows where company_name is NaN
        subset = subset.dropna(subset=['company_name'])
        
        # Set index to company_name for mapping
        subset.set_index('company_name', inplace=True)
        
        # Convert base_df to index for easier update
        # Warning: if duplicates exist in company_name, this might be tricky.
        # But 'companies.csv' implies unique companies or at least consistent list.
        # Let's assume unique company_name for now or use the first match.
        
        # Update base_df
        # We iterate over the columns we want to update
        for col in cols:
            # Map the values from subset to base_df
            # This respects the index (company_name)
            # update() in pandas is inplace and aligns on index
            
            # Using map might be safer to strictly control what we overwrite?
            # actually pandas update implies overwriting NaNs with values, 
            # but we want to overwrite even if base has something (if filled is newer)
            # or usually base is empty/old, and filled has new data.
            
            # Let's use map/combine_first logic manually to be safe and explicit
            # Recalculate match:
            # Create a series from subset for this col
            s_map = subset[col]
            
            # Use 'map' on base_df['company_name'] to get new values
            mapped_values = base_df['company_name'].map(s_map)
            
            # Where mapped_values is NOT NULL, update base_df
            # We can use update or combine_first. 
            # If we want to overwrite base:
            base_df.loc[mapped_values.notna(), col] = mapped_values[mapped_values.notna()]
            
            count = mapped_values.notna().sum()
            print(f"  Updated {col}: {count} records")

    # Save
    print(f"Saving merged data to {OUTPUT_FILE}...")
    base_df.to_csv(OUTPUT_FILE, index=False, encoding='utf-8-sig') # utf-8-sig for Excel compatibility
    print("Done.")

if __name__ == "__main__":
    main()
