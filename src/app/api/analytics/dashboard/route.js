import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { EventAnalytics } from '@/app/models/Analytics';

export async function GET() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB for analytics dashboard...');
    await connectDB();
    console.log('Connected to MongoDB successfully');
    
    // Fetch all analytics events
    const allAnalytics = await EventAnalytics.find()
      .sort({ timestamp: 1 }) // Sort by timestamp ascending
      .lean(); // Convert to plain JavaScript objects
    
    console.log(`Retrieved ${allAnalytics.length} analytics events from MongoDB`);
    
    return NextResponse.json(allAnalytics);
  } catch (error) {
    console.error('Error fetching analytics from MongoDB:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error.message },
      { status: 500 }
    );
  }
} 