import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Fallback data in case Google Sheets fails
const fallbackData = [
  {
    'Shiva Categorie': 'Example',
    'What': 'Sample Activity',
    'For Who': 'Everyone',
    'When': '2024-01-01',
    'Where': 'Sample Location'
  }
];

async function readLocalJSON() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'documents', 'data.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return data;
  } catch (error) {
    console.error('Error reading local JSON:', error);
    return null;
  }
}

export async function GET() {
  try {
    // First try Google Sheets
    if (process.env.GOOGLE_SHEETS_CLIENT_EMAIL && 
        process.env.GOOGLE_SHEETS_PRIVATE_KEY && 
        process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
      try {
        console.log('Attempting Google Sheets connection...');
        console.log('Client email:', process.env.GOOGLE_SHEETS_CLIENT_EMAIL);
        console.log('Spreadsheet ID:', process.env.GOOGLE_SHEETS_SPREADSHEET_ID);
        
        // Format the private key correctly
        const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n');
        console.log('Private key formatted:', privateKey ? 'Yes' : 'No');

        // Create JWT auth client
        const auth = new google.auth.JWT({
          email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
          key: privateKey,
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
        });

        // Test authentication
        console.log('Testing authentication...');
        await auth.authorize();
        console.log('Authentication successful');

        // Create Google Sheets client
        const sheets = google.sheets({ 
          version: 'v4', 
          auth,
          timeout: 10000
        });

        // Get spreadsheet data
        console.log('Fetching spreadsheet data...');
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
          range: 'Sheet1',
        });

        if (response.data.values) {
          console.log('Data fetched successfully');
          // Convert to objects
          const headers = response.data.values[0];
          const data = response.data.values.slice(1).map(row => {
            const item = {};
            headers.forEach((header, index) => {
              item[header] = row[index] || '';
            });
            return item;
          });

          return NextResponse.json(data);
        } else {
          console.error('No data values in response');
          throw new Error('No data values in response');
        }
      } catch (sheetsError) {
        console.error('Google Sheets error details:', {
          message: sheetsError.message,
          code: sheetsError.code,
          errors: sheetsError.errors,
          response: sheetsError.response?.data
        });
        // Continue to fallback
      }
    } else {
      console.error('Missing Google Sheets credentials:', {
        hasClientEmail: !!process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.GOOGLE_SHEETS_PRIVATE_KEY,
        hasSpreadsheetId: !!process.env.GOOGLE_SHEETS_SPREADSHEET_ID
      });
    }

    // If Google Sheets fails or credentials are missing, try local JSON
    console.log('Falling back to local JSON...');
    const localData = await readLocalJSON();
    if (localData) {
      console.log('Using local JSON data');
      return NextResponse.json(localData);
    }

    console.log('Both Google Sheets and local JSON failed, returning empty array');
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error in sheets route:', error);
    return NextResponse.json({ 
      error: 'Error fetching data',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 
