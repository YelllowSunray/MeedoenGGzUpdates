import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Helper function to check if a row is empty or contains only empty strings
function isRowEmpty(row) {
  if (!row) return true;
  return Object.values(row).every(value => !value || value.trim() === '');
}

// Fallback data in case Google Sheets fails
const fallbackData = [
  {
    'What': 'Sample Activity',
    'For Who': 'Everyone',
    'When': '2024-01-01',
    'Where': 'Sample Location',
    'How much?': 'Free',
    'Unnamed: 7': 'Sample Description',
    'Unnamed: 14': 'sample, test'
  }
];

async function readLocalJSON() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'documents', 'data.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log('Local JSON entries:', data.length);
    return data;
  } catch (error) {
    console.error('Error reading local JSON:', error);
    return null;
  }
}

export async function GET() {
  try {
    console.log('Starting API request...');
    
    // Try Google Sheets first
    if (process.env.GOOGLE_SHEETS_CLIENT_EMAIL && 
        process.env.GOOGLE_SHEETS_PRIVATE_KEY && 
        process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
      try {
        console.log('Attempting to fetch from Google Sheets...');
        console.log('Using spreadsheet ID:', process.env.GOOGLE_SHEETS_SPREADSHEET_ID);
        
        const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n');
        
        const auth = new google.auth.JWT({
          email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
          key: privateKey,
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
        });

        await auth.authorize();
        console.log('Google Sheets authentication successful');

        const sheets = google.sheets({ 
          version: 'v4', 
          auth,
          timeout: 10000
        });

        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
          range: 'Sheet1',
        });

        if (response.data.values) {
          const headers = response.data.values[0];
          console.log('Headers from Google Sheets:', headers);
          
          const data = response.data.values.slice(1).map(row => {
            const item = {};
            headers.forEach((header, index) => {
              item[header] = row[index] || '';
            });
            return item;
          });

          console.log(`Successfully fetched ${data.length} items from Google Sheets`);
          return NextResponse.json(data);
        } else {
          throw new Error('No data values in response');
        }
      } catch (sheetsError) {
        console.error('Google Sheets error:', sheetsError);
        console.log('Falling back to local JSON...');
      }
    } else {
      console.log('Google Sheets credentials not found, using local JSON');
    }

    // Fallback to local JSON
    const filePath = path.join(process.cwd(), 'public', 'documents', 'data.json');
    console.log('Looking for data.json at:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.error('data.json file not found at:', filePath);
      return NextResponse.json({ error: 'No data source available' }, { status: 500 });
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    console.log('File content length:', fileContent.length);
    
    const data = JSON.parse(fileContent);
    console.log(`Successfully loaded ${data.length} items from local JSON`);
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format: expected an array');
    }
    
    if (data.length === 0) {
      console.warn('Local JSON file is empty');
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in sheets API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities', details: error.message },
      { status: 500 }
    );
  }
} 

