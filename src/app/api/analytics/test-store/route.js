import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { EventAnalytics } from '@/app/models/Analytics';

export async function GET() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB successfully');

    // Create a test event
    const testEvent = {
      action: 'test',
      timestamp: new Date(),
      testField: 'This is a test event',
      userAgent: 'Test Agent',
      screenSize: '1920x1080'
    };

    // Store in MongoDB
    const result = await EventAnalytics.create(testEvent);
    console.log('Test event stored in MongoDB:', result);

    // Retrieve the test event
    const storedEvent = await EventAnalytics.findById(result._id).lean();

    return NextResponse.json({
      success: true,
      message: 'Test event stored and retrieved from MongoDB successfully',
      stored: result,
      retrieved: storedEvent
    });
  } catch (error) {
    console.error('Test store error:', error);
    return NextResponse.json(
      { error: 'Test store failed', details: error.message },
      { status: 500 }
    );
  }
} 