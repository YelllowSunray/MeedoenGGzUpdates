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

export async function GET() {
  try {
    // Log environment variables (without private key)
    console.log('Checking environment variables...');
    console.log('Client email exists:', !!process.env.GOOGLE_SHEETS_CLIENT_EMAIL);
    console.log('Private key exists:', !!process.env.GOOGLE_SHEETS_PRIVATE_KEY);
    console.log('Spreadsheet ID:', process.env.GOOGLE_SHEETS_SPREADSHEET_ID);

    if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL || 
        !process.env.GOOGLE_SHEETS_PRIVATE_KEY || 
        !process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
      throw new Error('Missing required Google Sheets environment variables. Please check your .env.local file.');
    }

    console.log('Attempting to connect to Google Sheets...');
    
    // Format the private key correctly
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n');

    // Create JWT auth client
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });

    console.log('Created JWT auth client');

    // First, test the auth
    try {
      console.log('Testing authentication...');
      await auth.authorize();
      console.log('Authentication successful!');
    } catch (authError) {
      console.error('Authentication failed:', {
        error: authError.message,
        code: authError.code,
        stack: authError.stack,
        details: authError.errors || 'No additional error details'
      });
      throw new Error(`Google Sheets authentication failed: ${authError.message}. Please check if the service account has access to the spreadsheet.`);
    }

    // Create Google Sheets client with timeout
    const sheets = google.sheets({ 
      version: 'v4', 
      auth,
      timeout: 10000 // 10 second timeout
    });
    console.log('Created Sheets client');

    try {
      // First get spreadsheet metadata
      console.log('Fetching spreadsheet metadata...');
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      });
      
      console.log('Available sheets:', spreadsheet.data.sheets.map(sheet => sheet.properties.title));

      // Try to get data
      console.log('Fetching sheet data...');
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        range: spreadsheet.data.sheets[0].properties.title, // Use first sheet
      });

      if (!response.data.values) {
        throw new Error('No data found in spreadsheet. Please check if the spreadsheet has data.');
      }

      console.log('Data fetched successfully from Google Sheets!');
      console.log('Number of rows:', response.data.values.length);
      console.log('Headers:', response.data.values[0]);

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
    } catch (sheetsError) {
      console.error('Google Sheets API error:', {
        message: sheetsError.message,
        code: sheetsError.code,
        errors: sheetsError.errors || 'No additional error details',
        stack: sheetsError.stack,
        response: sheetsError.response?.data || 'No response data'
      });
      throw new Error(`Google Sheets API error: ${sheetsError.message}. Please check if the spreadsheet exists and is accessible.`);
    }
  } catch (error) {
    console.error('Fatal error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      details: error.errors || 'No additional error details'
    });
    return NextResponse.json({ 
      error: error.message,
      details: 'Please check: 1) Google Sheets API is enabled, 2) Service account has access to the spreadsheet, 3) Spreadsheet ID is correct'
    }, { status: 500 });
  }
}

async function readLocalJSON() {
  try {
    console.log('Attempting to read local JSON...');
    const filePath = path.join(process.cwd(), 'public', 'documents', 'data.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log('Successfully read from local JSON');
    return NextResponse.json(data);
  } catch (fileError) {
    console.error('Local JSON error:', fileError.message);
    return NextResponse.json([]);
  }
} 