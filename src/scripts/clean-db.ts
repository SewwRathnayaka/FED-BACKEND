import mongoose from "mongoose";
import { connectDB } from "../infrastructure/db";
import Order from "../infrastructure/schemas/Order";
import Address from "../infrastructure/schemas/Address";
import "dotenv/config";

async function cleanDB() {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Delete all orders
    await Order.deleteMany({});
    console.log("🗑️ Cleared all orders");

    // Delete all addresses
    await Address.deleteMany({});
    console.log("🗑️ Cleared all addresses");

    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");

  } catch (error) {
    console.error("❌ Error cleaning database:", error);
    process.exit(1);
  }
}

cleanDB();