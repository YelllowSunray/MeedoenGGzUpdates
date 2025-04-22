import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Session } from '@/app/models/Analytics';

export async function GET() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB for sessions data...');
    await connectDB();
    console.log('Connected to MongoDB successfully');
    
    // Fetch all sessions
    const sessions = await Session.find()
      .sort({ startTime: -1 }) // Sort by start time descending (newest first)
      .lean(); // Convert to plain JavaScript objects
    
    console.log(`Retrieved ${sessions.length} sessions from MongoDB`);
    
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions from MongoDB:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions', details: error.message },
      { status: 500 }
    );
  }
} 