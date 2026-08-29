import mongoose from 'mongoose';
import { env } from './env.js';

let mongoMemoryServer = null;

export const connectDB = async () => {
  try {
    // Try connecting to provided MONGODB_URI first with a short timeout
    console.log(`[DB] Attempting connection to MongoDB at: ${env.MONGODB_URI}`);
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      dbName: 'agentflow_ai',
    });
    console.log(`[DB] Successfully connected to MongoDB at ${env.MONGODB_URI}`);
  } catch (primaryErr) {
    console.warn(`[DB] External MongoDB connection failed (${primaryErr.message}).`);
    
    // If auto or true, fallback to MongoMemoryServer
    if (env.USE_IN_MEMORY_DB === 'auto' || env.USE_IN_MEMORY_DB === 'true' || env.USE_IN_MEMORY_DB === true) {
      console.log('[DB] Initializing In-Memory MongoDB instance fallback...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
        const memoryUri = mongoMemoryServer.getUri();
        await mongoose.connect(memoryUri);
        console.log(`[DB] In-Memory MongoDB running successfully at ${memoryUri}`);
      } catch (memErr) {
        console.error('[DB] Failed to start In-Memory MongoDB:', memErr.message);
        throw memErr;
      }
    } else {
      throw primaryErr;
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    console.log('[DB] Database disconnected.');
  } catch (err) {
    console.error('[DB] Error during disconnect:', err.message);
  }
};
