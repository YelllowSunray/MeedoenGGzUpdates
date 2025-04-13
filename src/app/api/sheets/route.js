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
    const filePath = path.join(process.cwd(), 'public', 'documents', 'data.json');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Data file not found' },
        { status: 404 }
      );
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    if (!fileContent) {
      return NextResponse.json(
        { error: 'Data file is empty' },
        { status: 500 }
      );
    }
    
    let data;
    try {
      data = JSON.parse(fileContent);
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 500 }
      );
    }
    
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 

