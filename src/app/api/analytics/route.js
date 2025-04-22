import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { EventAnalytics } from '@/app/models/Analytics';

// Force dynamic rendering to prevent build-time issues
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { action, data } = await request.json();
    
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const db = await connectDB();
    console.log('Connected to MongoDB successfully');

    // Create analytics entry based on action type
    const timestamp = new Date();
    let result;

    // Create the event document
    const eventData = {
      action,
      timestamp,
      ...data
    };

    // Store in the EventAnalytics collection
    result = await EventAnalytics.create(eventData);
    console.log(`Stored ${action} event in MongoDB:`, result);

    return NextResponse.json({ success: true, id: result._id });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to record analytics', details: error.message },
      { status: 500 }
    );
  }
} 