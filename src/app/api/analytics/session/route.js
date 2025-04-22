import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import path from 'path';
import fs from 'fs';

// Helper function to get the current date in YYYY-MM-DD format
const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Helper function to get the session analytics file path
const getSessionFilePath = () => {
  const date = getCurrentDate();
  return path.join(process.cwd(), 'public', 'analytics', `sessions_${date}.json`);
};

// Helper function to ensure the analytics directory exists
const ensureAnalyticsDir = () => {
  const dir = path.join(process.cwd(), 'public', 'analytics');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export async function POST(request) {
  try {
    // Check if request body is empty
    const contentLength = request.headers.get('content-length');
    if (!contentLength || contentLength === '0') {
      console.error('Empty request body received');
      return NextResponse.json(
        { error: 'Empty request body' },
        { status: 400 }
      );
    }

    // Parse the request body
    let sessionData;
    try {
      const text = await request.text();
      if (!text) {
        throw new Error('Empty request body');
      }
      sessionData = JSON.parse(text);
      console.log('Received session data:', sessionData);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return NextResponse.json(
        { error: 'Invalid JSON data', details: error.message },
        { status: 400 }
      );
    }

    // Validate session data
    if (!sessionData || !sessionData.sessionId) {
      console.error('Missing session ID in data:', sessionData);
      return NextResponse.json(
        { error: 'Missing session ID' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const db = await connectDB();
    console.log('Connected to MongoDB successfully');

    // Save session data
    console.log('Saving session to database...');
    const collection = db.collection('Session');
    const result = await collection.insertOne(sessionData);
    console.log('Session saved successfully:', result);

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('Error recording session data:', error);
    return NextResponse.json(
      { error: 'Failed to record session data', details: error.message },
      { status: 500 }
    );
  }
} 