import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { EventAnalytics } from '@/app/models/Analytics';

export async function GET(request) {
  try {
    // Get query parameters (if any)
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const skip = parseInt(url.searchParams.get('skip') || '0', 10);
    
    // Connect to MongoDB
    console.log(`Connecting to MongoDB for filter events... (limit: ${limit}, skip: ${skip})`);
    await connectDB();
    console.log('Connected to MongoDB successfully');

    // Find events with action = 'filter_apply'
    const filterEvents = await EventAnalytics.find({ action: 'filter_apply' })
      .sort({ timestamp: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await EventAnalytics.countDocuments({ action: 'filter_apply' });

    console.log(`Found ${filterEvents.length} filter events in MongoDB (total: ${total})`);

    return NextResponse.json({
      events: filterEvents,
      pagination: {
        total,
        limit,
        skip,
        hasMore: total > (skip + limit)
      }
    });
  } catch (error) {
    console.error('Error fetching filter events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter events', details: error.message },
      { status: 500 }
    );
  }
} 