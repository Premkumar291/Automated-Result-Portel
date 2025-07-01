import mongoose from 'mongoose';

export const connectDb = async () => {
  try {
    // Check if MONGO_URI is defined
    if (!process.env.MONGO_URI) {
      console.error('Error: MONGO_URI is not defined in environment variables');
      console.error('Please check your .env file and ensure MONGO_URI is properly set');
      process.exit(1);
    }

    console.log('Attempting to connect to MongoDB...');
    console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // Increased from 5000ms
      socketTimeoutMS: 45000,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 10000,
      // Retry configuration
      retryWrites: true
    });   
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.error('Full error details:', error);
    process.exit(1); // Exit the process with failure
  }
};