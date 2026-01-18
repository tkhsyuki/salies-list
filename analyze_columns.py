import pandas as pd
import io

try:
    # Use the robust parsing logic or just pandas with error_bad_lines=False for quick analysis
    # Since we fixed the import, let's try reading it carefully.
    # Actually, for analysis, I just want the industry and region columns.
    
    df = pd.read_csv('companies.csv', on_bad_lines='skip', low_memory=False)
    
    print("--- Industry Analysis ---")
    print(f"Total unique industries: {df['industry'].nunique()}")
    print("Top 20 Industries:")
    print(df['industry'].value_counts().head(20))
    
    print("\n--- Region Analysis ---")
    print(f"Total unique regions: {df['region'].nunique()}")
    print("Top 20 Regions:")
    print(df['region'].value_counts().head(20))
    
except Exception as e:
    print(e)
