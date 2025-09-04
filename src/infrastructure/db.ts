import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connectionString = process.env.MONGODB_URI;
    if (!connectionString) {
      throw new Error("MongoDB connection string not found");
    }

    await mongoose.connect(connectionString, {
      maxPoolSize: 20, // Increased pool size
      minPoolSize: 5, // Minimum connections to maintain
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      serverSelectionTimeoutMS: 5000, // Reduced timeout for faster failure detection
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000, // Connection timeout
      family: 4,
      retryWrites: true,
      w: 'majority',
      ssl: true,
      bufferCommands: false // Disable mongoose buffering
    });

    console.log("✅ Connected to MongoDB successfully");

  } catch (error: any) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
};