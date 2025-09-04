import mongoose from "mongoose";
import Product from "../infrastructure/schemas/Product";
import Category from "../infrastructure/schemas/Category";
import Order from "../infrastructure/schemas/Order";
import dotenv from "dotenv";
import { connectDB } from "../infrastructure/db";

// Load environment variables
dotenv.config();

async function createIndexes() {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");

    console.log("🔧 Creating indexes...");

    // Create Product indexes
    try {
      await Product.collection.createIndex({ categoryId: 1 });
      console.log("✅ Created Product categoryId index");
    } catch (error: any) {
      if (error.code === 86) {
        console.log("ℹ️ Product categoryId index already exists");
      } else {
        throw error;
      }
    }
    
    try {
      await Product.collection.createIndex({ name: 1 });
      console.log("✅ Created Product name index");
    } catch (error: any) {
      if (error.code === 86) {
        console.log("ℹ️ Product name index already exists");
      } else {
        throw error;
      }
    }
    
    try {
      await Product.collection.createIndex({ price: 1 });
      console.log("✅ Created Product price index");
    } catch (error: any) {
      if (error.code === 86) {
        console.log("ℹ️ Product price index already exists");
      } else {
        throw error;
      }
    }
    
    try {
      await Product.collection.createIndex({ stock: 1 });
      console.log("✅ Created Product stock index");
    } catch (error: any) {
      if (error.code === 86) {
        console.log("ℹ️ Product stock index already exists");
      } else {
        throw error;
      }
    }
    
    try {
      await Product.collection.createIndex({ createdAt: -1 });
      console.log("✅ Created Product createdAt index");
    } catch (error: any) {
      if (error.code === 86) {
        console.log("ℹ️ Product createdAt index already exists");
      } else {
        throw error;
      }
    }

    // Create Category indexes
    try {
      await Category.collection.createIndex({ name: 1 });
      console.log("✅ Created Category name index");
    } catch (error: any) {
      if (error.code === 86) {
        console.log("ℹ️ Category name index already exists");
      } else {
        throw error;
      }
    }

    // Create Order indexes
    try {
      await Order.collection.createIndex({ userId: 1 });
      console.log("✅ Created Order userId index");
    } catch (error: any) {
      if (error.code === 86) {
        console.log("ℹ️ Order userId index already exists");
      } else {
        throw error;
      }
    }
    
    try {
      await Order.collection.createIndex({ orderStatus: 1 });
      console.log("✅ Created Order orderStatus index");
    } catch (error: any) {
      if (error.code === 86) {
        console.log("ℹ️ Order orderStatus index already exists");
      } else {
        throw error;
      }
    }
    
    try {
      await Order.collection.createIndex({ paymentStatus: 1 });
      console.log("✅ Created Order paymentStatus index");
    } catch (error: any) {
      if (error.code === 86) {
        console.log("ℹ️ Order paymentStatus index already exists");
      } else {
        throw error;
      }
    }
    
    try {
      await Order.collection.createIndex({ createdAt: -1 });
      console.log("✅ Created Order createdAt index");
    } catch (error: any) {
      if (error.code === 86) {
        console.log("ℹ️ Order createdAt index already exists");
      } else {
        throw error;
      }
    }
    
    try {
      await Order.collection.createIndex({ userId: 1, createdAt: -1 });
      console.log("✅ Created Order compound index (userId, createdAt)");
    } catch (error: any) {
      if (error.code === 86) {
        console.log("ℹ️ Order compound index already exists");
      } else {
        throw error;
      }
    }

    console.log("🎉 All indexes created successfully!");

    // List all indexes
    console.log("\n📋 Current indexes:");
    
    const productIndexes = await Product.collection.getIndexes();
    console.log("Product indexes:", Object.keys(productIndexes));
    
    const categoryIndexes = await Category.collection.getIndexes();
    console.log("Category indexes:", Object.keys(categoryIndexes));
    
    const orderIndexes = await Order.collection.getIndexes();
    console.log("Order indexes:", Object.keys(orderIndexes));

    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");

  } catch (error) {
    console.error("❌ Error creating indexes:", error);
    process.exit(1);
  }
}

createIndexes();
