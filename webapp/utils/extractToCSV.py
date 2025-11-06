#!/usr/bin/env python3
"""
Extract data fields from test.json and export to CSV
Usage: python3 extractToCSV.py
"""

import json
import csv

def extract_data_to_csv():
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

    # Export to CSV
    output_file = 'extracted_data.csv'
    print(f"📝 Writing to {output_file}...")

    if extracted_data:
        keys = extracted_data[0].keys()
        with open(output_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            writer.writerows(extracted_data)

        print(f"✅ Successfully exported {len(extracted_data)} records to {output_file}")
        print("\n📊 Preview of first 3 rows:")
        for i, row in enumerate(extracted_data[:3], 1):
            print(f"  Row {i}: ParentId={row['ParentId']}, Parent={row['Parent']}, Child={row['Child']}")

    return output_file

if __name__ == "__main__":
    try:
        output_file = extract_data_to_csv()
        print(f"\n🎉 Done! CSV file created: '{output_file}'")
        print("   You can open this in Excel or any spreadsheet application.")
    except FileNotFoundError:
        print("❌ test.json file not found in current directory")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
