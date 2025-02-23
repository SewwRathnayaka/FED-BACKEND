import mongoose from "mongoose";
import Product from "./schemas/Product";
import Category from "./schemas/Category";
import "dotenv/config";
import { connectDB } from "./db";

const seedDatabase = async () => {
  try {
    // First connect to the database
    await connectDB();
    console.log("Connected to database, starting seed...");

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});

    // Create categories
    const categories = [
      { name: "All" },
      { name: "Headphones" },
      { name: "Earbuds" },
      { name: "Speakers" },
      { name: "Mobile Phones" },
      { name: "Smart Watches" }
    ];

    const createdCategories = await Category.create(categories);

    // Create products with proper references
    const products = [
      {
        categoryId: createdCategories[1]._id, // Headphones
        image: "/assets/products/airpods-max.png",
        name: "AirPods Max",
        price: 549.00,
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas, sequi?"
      },
      {
        categoryId: createdCategories[3]._id, // Speakers
        image: "/assets/products/echo-dot.png",
        name: "Echo Dot",
        price: 99.00,
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas, sequi?"
      },
      {
        categoryId: createdCategories[2]._id, // Earbuds
        image: "/assets/products/pixel-buds.png",
        name: "Galaxy Pixel Buds",
        price: 99.00,
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas, sequi?"
      },
      {
        categoryId: createdCategories[1]._id, // Headphones
        image: "/assets/products/quietcomfort.png",
        name: "Bose QuiteComfort",
        price: 249.00,
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas, sequi?"
      },
      {
        categoryId: createdCategories[3]._id, // Speakers
        image: "/assets/products/soundlink.png",
        name: "Bose SoundLink",
        price: 119.00,
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas, sequi?"
      },
      {
        categoryId: createdCategories[5]._id, // Smart Watches
        image: "/assets/products/apple-watch.png",
        name: "Apple Watch 9",
        price: 699.00,
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas, sequi?"
      },
      {
        categoryId: createdCategories[4]._id, // Mobile Phones
        image: "/assets/products/iphone-15.png",
        name: "Apple Iphone 15",
        price: 1299.00,
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas, sequi?"
      },
      {
        categoryId: createdCategories[4]._id, // Mobile Phones
        image: "/assets/products/pixel-8.png",
        name: "Galaxy Pixel 8",
        price: 549.00,
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas, sequi?"
      }
    ];

    await Product.create(products);

    console.log("Database seeded successfully!");
    
    // Debug: Print all products with their categories
    const allProducts = await Product.find({}).lean();
    console.log("\nSeeded Products:");
    allProducts.forEach(product => {
      console.log(`- ${product.name} (Category ID: ${product.categoryId})`);
    });

    const allCategories = await Category.find({}).lean();
    console.log("\nSeeded Categories:");
    allCategories.forEach(category => {
      console.log(`- ${category.name} (ID: ${category._id})`);
    });

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Add a slight delay before disconnecting to ensure all operations complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    await mongoose.disconnect();
    console.log("Database connection closed.");
  }
};

// Execute the seed function
seedDatabase(); 