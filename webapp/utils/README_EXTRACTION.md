# Data Extraction from test.json

## Summary

Successfully extracted data fields from `test.json` and exported to Excel format.

## Output Files

1. **extracted_data.xlsx** - Excel format (45KB, 99 records)
2. **extracted_data.csv** - CSV format (12KB, 99 records)

## Extracted Fields

From each object in test.json, the following fields were extracted:

- **Index** - Sequential record number
- **ParentId** - ID from data.ParentId
- **Parent** - Path from data.Parent
- **Child** - Name from data.Child
- **RequestUri** - Request URI from root level
- **Method** - HTTP method from root level

## Scripts Created

### 1. extractToExcel.js (Node.js)
```bash
node extractToExcel.js
```
- Requires: `npm install xlsx`
- Output: extracted_data.xlsx

### 2. extractToCSV.py (Python)
```bash
python3 extractToCSV.py
```
- No external dependencies required
- Output: extracted_data.csv

### 3. extractToExcel.py (Python with Excel support)
```bash
# Requires: pip3 install pandas openpyxl
python3 extractToExcel.py
```
- Output: extracted_data.xlsx with better formatting

## Sample Data

```
Index | ParentId | Parent                            | Child
------|----------|-----------------------------------|---------------------------
1     | GI001    | cop/GI/Finance/                   | Controller
2     | GI002    | cop/GI/Finance/Controller/        | CPCCD
3     | GI003    | cop/GI/Finance/Controller/CPCCD/  | Capital Program and Budget
...
```

## Total Records

**99 records** extracted from test.json

## How to View

- **Excel**: Open `extracted_data.xlsx` in Microsoft Excel, LibreOffice Calc, or Google Sheets
- **CSV**: Open `extracted_data.csv` in any spreadsheet application or text editor

## File Locations

All files are located in:
```
/Users/faddevmpb3/Desktop/ui5 proxy/ZFI_Mobile_Finance_Config/webapp/utils/
```
