import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connectionString = process.env.MONGODB_URI;
    if (!connectionString) {
      throw new Error("MongoDB connection string not found");
    }

    await mongoose.connect(connectionString, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: 'majority',
      ssl: true,
      tlsAllowInvalidHostnames: false,
      directConnection: false
    });

    console.log("✅ Connected to MongoDB successfully");
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

  } catch (error: any) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
};