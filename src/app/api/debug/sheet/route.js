import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request) {
  // Extract query parameters
  const { searchParams } = new URL(request.url);
  const sheetName = searchParams.get('sheet') || 'Blad1';
  const range = searchParams.get('range') || 'A:O';
  
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
      return NextResponse.json({ error: 'Spreadsheet ID is missing' }, { status: 500 });
    }
    
    // Get the data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      auth: authClient,
      spreadsheetId,
      range: `${sheetName}!${range}`,
    });
    
    // Early return if no values found
    if (!response.data.values || response.data.values.length < 2) {
      return NextResponse.json({
        rawValues: response.data.values || [],
        transformedData: [],
        message: 'No data found in spreadsheet or not enough rows',
      });
    }

    // Raw values
    const rawValues = response.data.values;
    
    // Transform the data into the expected format
    const [headers, ...rows] = rawValues;
    
    // Define expected field mappings (from spreadsheet headers to app fields)
    const fieldMap = {
      'unnamed: 0': 'Unnamed: 0',
      'unnamed: 1': 'Unnamed: 1', 
      'why': 'Why',
      'for who': 'For Who',
      'what': 'What',
      'what specific': 'What specific',
      'how': 'How',
      'unnamed: 7': 'Unnamed: 7', // Description
      'where': 'Where',
      'by who': 'By who',
      'unnamed: 10': 'Unnamed: 10',
      'unnamed: 11': 'Unnamed: 11', // Contact
      'when': 'When',
      'how much?': 'How much?',
      'unnamed: 14': 'Unnamed: 14' // Tags
    };
    
    // Map actual headers to expected field names
    const headerMap = {};
    headers.forEach((header, index) => {
      if (!header) {
        headerMap[index] = `Column ${index + 1}`;
        return;
      }
      
      // Find the expected field for this header
      const normalizedHeader = header.toLowerCase().trim();
      for (const [expectedName, appField] of Object.entries(fieldMap)) {
        if (normalizedHeader === expectedName) {
          headerMap[index] = appField;
          return;
        }
      }
      
      // If no mapping found, use original header
      headerMap[index] = header;
    });
    
    const transformedData = rows.map(row => {
      const item = {};
      
      // Use mapped header names
      for (let i = 0; i < Math.max(headers.length, row.length); i++) {
        if (i in headerMap) {
          item[headerMap[i]] = i < row.length ? row[i] || null : null;
        }
      }
      
      return item;
    });

    return NextResponse.json({
      rawValues,
      transformedData,
      headerMap
    });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return NextResponse.json({
      error: 'Failed to fetch data',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 