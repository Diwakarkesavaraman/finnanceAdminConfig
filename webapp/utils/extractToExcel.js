const fs = require('fs');
const XLSX = require('xlsx');

// Read the JSON file
const jsonData = JSON.parse(fs.readFileSync('./test.json', 'utf8'));

// Extract data fields from each object
const extractedData = jsonData.map((item, index) => {
    return {
        Index: index + 1,
        ParentId: item.data.ParentId || '',
        Parent: item.data.Parent || '',
        Child: item.data.Child || '',
        RequestUri: item.requestUri || '',
        Method: item.method || ''
    };
});

// Create a new workbook
const workbook = XLSX.utils.book_new();

// Convert JSON to worksheet
const worksheet = XLSX.utils.json_to_sheet(extractedData);

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Extracted Data');

// Write the workbook to an Excel file
XLSX.writeFile(workbook, 'extracted_data.xlsx');

console.log('✅ Data extracted successfully!');
console.log(`📊 Total records: ${extractedData.length}`);
console.log('📁 Output file: extracted_data.xlsx');
