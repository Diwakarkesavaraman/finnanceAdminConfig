#!/usr/bin/env python3
"""
Extract data fields from test.json and export to Excel
Usage: python3 extractToExcel.py
"""

import json
import pandas as pd
from pathlib import Path

def extract_data_to_excel():
    # Read the JSON file
    print("📖 Reading test.json...")
    with open('test.json', 'r', encoding='utf-8') as f:
        json_data = json.load(f)

    print(f"✅ Loaded {len(json_data)} records")

    # Extract data fields from each object
    extracted_data = []
    for index, item in enumerate(json_data, start=1):
        data_obj = item.get('data', {})
        extracted_data.append({
            'Index': index,
            'ParentId': data_obj.get('ParentId', ''),
            'Parent': data_obj.get('Parent', ''),
            'Child': data_obj.get('Child', ''),
            'RequestUri': item.get('requestUri', ''),
            'Method': item.get('method', '')
        })

    # Create DataFrame
    df = pd.DataFrame(extracted_data)

    # Export to Excel
    output_file = 'extracted_data.xlsx'
    print(f"📝 Writing to {output_file}...")
    df.to_excel(output_file, index=False, sheet_name='Extracted Data')

    print(f"✅ Successfully exported {len(extracted_data)} records to {output_file}")
    print("\n📊 Preview of first 5 rows:")
    print(df.head())

    return output_file

if __name__ == "__main__":
    try:
        output_file = extract_data_to_excel()
        print(f"\n🎉 Done! Open '{output_file}' to view the results.")
    except ImportError as e:
        print("❌ Missing required package.")
        print("Please install pandas and openpyxl:")
        print("  pip3 install pandas openpyxl")
    except FileNotFoundError:
        print("❌ test.json file not found in current directory")
    except Exception as e:
        print(f"❌ Error: {e}")
