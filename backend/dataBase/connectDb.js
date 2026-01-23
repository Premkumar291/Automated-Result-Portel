import mongoose from 'mongoose';
import { initGridFS } from '../utils/gridfsConfig.js';

// MongoDB connection with GridFS initialization
export const connectDb = async () => {
  try {
    // Check if MONGODB_URI is defined
    if (!process.env.MONGODB_URI) {
      const error = new Error('MONGODB_URI is not defined in environment variables');
      console.error('Error:', error.message);
      console.error('Please check your Vercel environment variables and ensure MONGODB_URI is properly set');
      throw error;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('Attempting to connect to MongoDB...');
      console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    }

    if (mongoose.connection.readyState >= 1) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Using existing MongoDB connection');
      }
      return mongoose;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: false, // Don't build indexes on every startup (performance)
      bufferCommands: false,
      maxPoolSize: process.env.VERCEL ? 1 : 10, // 1 for serverless, 10 for standard server
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 5000,
    });

    // Initialize GridFS
    const { gfs, gridFSBucket } = initGridFS(conn.connection);
    if (process.env.NODE_ENV !== 'production') {
      console.log('GridFS initialized successfully');
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`MongoDB connected successfully: ${conn.connection.host}`);
    }
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    if (process.env.NODE_ENV !== 'production') {
      console.error('Full error details:', error);
    }
    throw error; // Re-throw for serverless error handling
  }
};
