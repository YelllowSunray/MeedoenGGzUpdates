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
    // Try Google Sheets first
    if (process.env.GOOGLE_SHEETS_CLIENT_EMAIL && 
        process.env.GOOGLE_SHEETS_PRIVATE_KEY && 
        process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
      try {
        console.log('Fetching from Google Sheets...');
        
        const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n');

        const auth = new google.auth.JWT({
          email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
          key: privateKey,
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
        });

        await auth.authorize();

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
          console.log('First row of data:', response.data.values[1]);
          
          const data = response.data.values.slice(1).map(row => {
            const item = {};
            headers.forEach((header, index) => {
              item[header] = row[index] || '';
            });
            return item;
          });

          console.log('Sample of processed data:', data[0]);
          console.log('Total Google Sheets entries:', data.length);
          return NextResponse.json(data);
        } else {
          throw new Error('No data values in response');
        }
      } catch (sheetsError) {
        console.error('Google Sheets error:', sheetsError);
        // If Google Sheets fails, try local JSON as fallback
        console.log('Falling back to local JSON...');
        const localData = await readLocalJSON();
        if (localData) {
          return NextResponse.json(localData);
        }
      }
    }

    // If both Google Sheets and local JSON fail, return empty array
    console.log('Both Google Sheets and local JSON failed, returning empty array');
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 });
  }
} 

