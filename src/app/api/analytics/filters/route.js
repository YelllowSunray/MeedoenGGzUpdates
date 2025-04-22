import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { EventAnalytics } from '@/app/models/Analytics';

export async function GET() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB successfully');

    // Find events with action = 'filter_apply'
    const filterEvents = await EventAnalytics.find({ action: 'filter_apply' })
      .sort({ timestamp: -1 }) // Newest first
      .limit(20) // Get last 20 events
      .lean();

    console.log(`Found ${filterEvents.length} filter events in MongoDB`);

    return NextResponse.json({
      success: true,
      count: filterEvents.length,
      events: filterEvents
    });
  } catch (error) {
    console.error('Error fetching filter events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter events', details: error.message },
      { status: 500 }
    );
  }
} 