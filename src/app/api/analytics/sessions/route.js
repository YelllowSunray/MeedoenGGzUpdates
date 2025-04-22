import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Session } from '@/app/models/Analytics';

export async function GET(request) {
  try {
    // Get query parameters (if any)
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '100', 10);
    const skip = parseInt(url.searchParams.get('skip') || '0', 10);
    
    // Connect to MongoDB
    console.log(`Connecting to MongoDB for sessions data... (limit: ${limit}, skip: ${skip})`);
    await connectDB();
    console.log('Connected to MongoDB successfully');
    
    // Fetch sessions with pagination
    const sessions = await Session.find()
      .sort({ startTime: -1 }) // Sort by start time descending (newest first)
      .skip(skip)
      .limit(limit)
      .lean(); // Convert to plain JavaScript objects
    
    // Get total count for pagination
    const total = await Session.countDocuments();
    
    console.log(`Retrieved ${sessions.length} sessions from MongoDB (total: ${total})`);
    
    return NextResponse.json({
      sessions: sessions,
      pagination: {
        total,
        limit,
        skip,
        hasMore: total > (skip + limit)
      }
    });
  } catch (error) {
    console.error('Error fetching sessions from MongoDB:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions', details: error.message },
      { status: 500 }
    );
  }
} 