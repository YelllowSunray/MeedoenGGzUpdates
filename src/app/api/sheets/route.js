import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  try {
    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    // Get authenticated client
    const authClient = await auth.getClient();
    
    // Initialize sheets API
    const sheets = google.sheets('v4');
    
    // Get the spreadsheet ID from environment variables
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    
    if (!spreadsheetId) {
      console.error('Spreadsheet ID is missing');
      return NextResponse.json({ error: 'Spreadsheet ID is missing' }, { status: 500 });
    }
    
    // Get the data from Google Sheets - try common sheet names in Dutch and English
    let response;
    const possibleSheets = ['Blad1', 'Sheet1', 'Data'];
    let usedSheet;
    
    for (const sheet of possibleSheets) {
      try {
        response = await sheets.spreadsheets.values.get({
          auth: authClient,
          spreadsheetId,
          range: `${sheet}!A:O`,
        });
        
        if (response.data.values && response.data.values.length > 1) {
          usedSheet = sheet;
          break;
        }
      } catch (err) {
        console.log(`Failed to get data from sheet "${sheet}": ${err.message}`);
      }
    }
    
    if (!response || !response.data.values || response.data.values.length < 2) {
      console.error('No data found in any sheet');
      return NextResponse.json([]);
    }
    
    console.log(`Successfully found data in sheet "${usedSheet}"`);
    
    // Raw values
    const rawValues = response.data.values;
    const [headers, ...rows] = rawValues;
    
    console.log("Original headers:", headers);
    
    // Define mappings for expected fields with the actual headers from Google Sheets
    const fieldMappings = {
      'Activity type': ['Activity type', 'What', 'Wat', 'Activiteit'],
      'Activity name': ['Activity name', 'What specific', 'Wat specifiek', 'Title', 'Titel'],
      'Doelgroep': ['Doelgroep', 'For Who', 'Voor wie', 'Target audience'],
      'Domein / Intentie': ['Domein / Intentie', 'Why', 'Waarom', 'Purpose', 'Doel'],
      'Beschrijving': ['Beschrijving', 'Activiteit long', 'Description', 'Details', 'Unnamed: 7'],
      'Address': ['Address', 'Where', 'Waar', 'Location', 'Locatie'],
      'organisatie': ['organisatie', 'By who', 'Door wie', 'Organizer', 'Organisator'],
      'Contact': ['Contact', 'Unnamed: 11', 'Contactgegevens'],
      'Wanneer? Hoe laat?': ['Wanneer? Hoe laat?', 'When', 'Wanneer', 'Date', 'Datum'],
      'Kosten': ['Kosten', 'How much?', 'Price', 'Prijs'],
      'Tags': ['Tags', 'Unnamed: 14', 'Keywords', 'Trefwoorden'],
      'Shiva Categorie': ['Shiva Categorie', 'Unnamed: 1', 'Category', 'Categorie'],
      'website': ['website', 'Website', 'URL']
    };
    
    // Create a mapping from header index to expected app field name
    const headerMap = {};
    headers.forEach((header, index) => {
      if (!header) {
        return; // Skip empty headers
      }
      
      // Special handling for Shiva Categorie field
      if (header === 'Shiva Categorie') {
        headerMap[index] = 'Shiva Categorie';
        console.log(`Found Shiva Categorie header at index ${index}`);
      } else {
        // Try to match the header to one of our expected fields
        const headerLower = header.toLowerCase().trim();
        
        // Find matching field (the goal is to map to our original field names)
        let mappedTo = null;
        for (const [standardField, possibleNames] of Object.entries(fieldMappings)) {
          // Try case-insensitive matching
          if (possibleNames.some(name => name.toLowerCase() === headerLower)) {
            headerMap[index] = standardField;
            mappedTo = standardField;
            break;
          }
        }
        
        // If no mapping found, use original header
        if (!headerMap[index]) {
          headerMap[index] = header;
        }
        
        console.log(`Header "${header}" mapped to "${headerMap[index]}" (${mappedTo ? 'matched' : 'not matched'})`);
      }
    });
    
    const data = rows.map(row => {
      const item = {};
      
      // Map each column using the header mapping
      for (let i = 0; i < row.length; i++) {
        if (i in headerMap) {
          item[headerMap[i]] = row[i] || null;
        }
      }
      
      return item;
    });
    
    if (data.length > 0) {
      console.log("Sample data item:", data[0]);
      console.log("Category value in sample:", data[0]['Shiva Categorie']);
      
      // Check if any items have the Shiva Categorie field
      const itemsWithCategory = data.filter(item => !!item['Shiva Categorie']).length;
      console.log(`Items with Shiva Categorie: ${itemsWithCategory} out of ${data.length}`);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return NextResponse.json({ error: 'Failed to fetch data', details: error.message }, { status: 500 });
  }
} 