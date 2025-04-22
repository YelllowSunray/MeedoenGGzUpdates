import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Session, Search, CategoryClick, Filter } from '@/app/models/Analytics';

export async function GET() {
  try {
    // Connect to database
    await connectDB();

    // Get counts of all collections
    const sessionCount = await Session.countDocuments();
    const searchCount = await Search.countDocuments();
    const categoryClickCount = await CategoryClick.countDocuments();
    const filterCount = await Filter.countDocuments();

    // Get some sample data
    const recentSessions = await Session.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentSearches = await Search.find()
      .sort({ timestamp: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({
      connection: 'success',
      counts: {
        sessions: sessionCount,
        searches: searchCount,
        categoryClicks: categoryClickCount,
        filters: filterCount
      },
      recentData: {
        sessions: recentSessions,
        searches: recentSearches
      }
    });
  } catch (error) {
    console.error('MongoDB test error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to connect to MongoDB',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Add test data
export async function POST() {
  try {
    await connectDB();

    // Create test session
    const session = new Session({
      sessionId: 'test_session_' + Date.now(),
      startTime: new Date(),
      endTime: new Date(),
      pageViews: [{
        page: '/',
        duration: 5000,
        timestamp: new Date()
      }],
      clicks: [{
        element: 'A',
        text: 'Test Link',
        href: '/test',
        timestamp: new Date()
      }],
      userAgent: 'Test Browser',
      screenSize: '1920x1080'
    });

    // Create test search
    const search = new Search({
      query: 'test search',
      timestamp: new Date(),
      results: 5
    });

    // Create test category click
    const categoryClick = new CategoryClick({
      category: 'test category',
      timestamp: new Date()
    });

    // Create test filter
    const filter = new Filter({
      filter: 'test filter',
      value: 'test value',
      timestamp: new Date()
    });

    // Save all test data
    await Promise.all([
      session.save(),
      search.save(),
      categoryClick.save(),
      filter.save()
    ]);

    return NextResponse.json({ 
      success: true,
      message: 'Test data created successfully'
    });
  } catch (error) {
    console.error('Error creating test data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create test data',
        details: error.message
      },
      { status: 500 }
    );
  }
} 