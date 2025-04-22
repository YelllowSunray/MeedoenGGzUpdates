import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import connectDB from '@/app/lib/db';
import { EventAnalytics, Session } from '@/app/models/Analytics';

// Helper function to get all analytics files
const getAnalyticsFiles = () => {
  const analyticsDir = path.join(process.cwd(), 'public', 'analytics');
  if (!fs.existsSync(analyticsDir)) {
    return [];
  }
  return fs.readdirSync(analyticsDir)
    .filter(file => file.endsWith('.json') && !file.startsWith('sessions_'))
    .map(file => path.join(analyticsDir, file));
};

// Helper function to get all session files
const getSessionFiles = () => {
  const analyticsDir = path.join(process.cwd(), 'public', 'analytics');
  if (!fs.existsSync(analyticsDir)) {
    return [];
  }
  return fs.readdirSync(analyticsDir)
    .filter(file => file.startsWith('sessions_') && file.endsWith('.json'))
    .map(file => path.join(analyticsDir, file));
};

// Helper function to read and parse a JSON file
const readJsonFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
};

export async function GET() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB for migration...');
    await connectDB();
    console.log('Connected to MongoDB successfully');
    
    // Migration stats
    const stats = {
      eventFiles: 0,
      sessionFiles: 0,
      eventsProcessed: 0,
      sessionsProcessed: 0,
      eventsMigrated: 0,
      sessionsMigrated: 0,
      errors: []
    };
    
    // Migrate regular analytics events
    const analyticsFiles = getAnalyticsFiles();
    stats.eventFiles = analyticsFiles.length;
    
    console.log(`Found ${analyticsFiles.length} analytics files to migrate`);
    
    for (const file of analyticsFiles) {
      const events = readJsonFile(file);
      stats.eventsProcessed += events.length;
      
      console.log(`Migrating ${events.length} events from ${path.basename(file)}`);
      
      for (const event of events) {
        try {
          // Format the data for the MongoDB model
          const eventData = {
            action: event.action,
            timestamp: new Date(event.timestamp),
            ...event.data
          };
          
          await EventAnalytics.create(eventData);
          stats.eventsMigrated++;
        } catch (error) {
          console.error(`Error migrating event:`, error);
          stats.errors.push(`Event migration error: ${error.message}`);
        }
      }
    }
    
    // Migrate session data
    const sessionFiles = getSessionFiles();
    stats.sessionFiles = sessionFiles.length;
    
    console.log(`Found ${sessionFiles.length} session files to migrate`);
    
    for (const file of sessionFiles) {
      const sessions = readJsonFile(file);
      stats.sessionsProcessed += sessions.length;
      
      console.log(`Migrating ${sessions.length} sessions from ${path.basename(file)}`);
      
      for (const session of sessions) {
        try {
          // Check if session already exists
          const existingSession = await Session.findOne({ sessionId: session.sessionId });
          
          if (!existingSession) {
            await Session.create({
              sessionId: session.sessionId,
              startTime: new Date(session.startTime),
              endTime: new Date(session.endTime),
              pageViews: session.pageViews.map(view => ({
                ...view,
                timestamp: new Date(view.timestamp)
              })),
              clicks: session.clicks.map(click => ({
                ...click,
                timestamp: new Date(click.timestamp)
              })),
              userAgent: session.userAgent,
              screenSize: session.screenSize
            });
            stats.sessionsMigrated++;
          }
        } catch (error) {
          console.error(`Error migrating session:`, error);
          stats.errors.push(`Session migration error: ${error.message}`);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      stats
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error.message },
      { status: 500 }
    );
  }
} 