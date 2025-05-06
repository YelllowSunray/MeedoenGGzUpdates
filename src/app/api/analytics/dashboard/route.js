import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { EventAnalytics } from '@/app/models/Analytics';

// Force dynamic rendering to prevent build-time issues
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Get query parameters (if any)
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '100', 10);
    const skip = parseInt(url.searchParams.get('skip') || '0', 10);
    
    // Connect to MongoDB
    console.log(`Connecting to MongoDB for analytics dashboard... (limit: ${limit}, skip: ${skip})`);
    const db = await connectDB();
    console.log('Connected to MongoDB successfully');
    
    // Fetch analytics events with pagination
    const allAnalytics = await EventAnalytics.find()
      .sort({ timestamp: -1 }) // Sort by timestamp descending (newest first)
      .skip(skip)
      .limit(limit)
      .lean(); // Convert to plain JavaScript objects
    
    // Get total count for pagination
    const total = await EventAnalytics.countDocuments();
    
    console.log(`Retrieved ${allAnalytics.length} analytics events from MongoDB (total: ${total})`);
    
    return NextResponse.json({
      events: allAnalytics,
      pagination: {
        total,
        limit,
        skip,
        hasMore: total > (skip + limit)
      }
    });
  } catch (error) {
    console.error('Error fetching analytics from MongoDB:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 