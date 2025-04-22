import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

// Only throw an error if we're not in a build context
if (!MONGODB_URI && typeof window !== 'undefined') {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // If we're in a build context and don't have a MongoDB URI, return a mock connection
  if (!MONGODB_URI) {
    console.log('No MongoDB URI found, using mock connection for build');
    return {
      collection: () => ({
        find: () => ({ toArray: async () => [] }),
        findOne: async () => null,
        insertOne: async () => ({ insertedId: 'mock-id' }),
        countDocuments: async () => 0
      })
    };
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Connect using Mongoose for schema validation
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      // Get the native MongoDB driver connection
      const db = mongoose.connection.db;
      return db;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export { connectDB };
export default connectDB; 