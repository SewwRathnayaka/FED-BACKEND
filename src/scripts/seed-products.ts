import mongoose from "mongoose";
import Product from "../infrastructure/schemas/Product";
import dotenv from "dotenv";
import { connectDB } from "../infrastructure/db";
import stripe from "../infrastructure/stripe";

// Load environment variables
dotenv.config();

async function seedProducts() {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Clear existing products
    await Product.deleteMany({});
    console.log("🗑️ Cleared existing products");

    // Create products with Stripe integration
    const productsData = [
      {
        categoryId: "67bb58dbc307f39c722c4fbc",
        image: "/assets/products/airpods-max.png",
        name: "AirPods Max",
        price: 549,
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas, sequi?",
        stock: 0
      },
      {
        categoryId: "67bb58dbc307f39c722c4fbe",
        image: "/assets/products/echo-dot.png",
        name: "Echo Dot",
        price: 99,
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas, sequi?",
        stock: 10
      },
      {
        categoryId: "67bb58dbc307f39c722c4fbd",
        image: "/assets/products/pixel-buds.png",
        name: "Galaxy Pixel Buds",
        price: 99,
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas, sequi?",
        stock: 19
      },
      {
        categoryId: "67bb58dbc307f39c722c4fbc",
        image: "/assets/products/quietcomfort.png",
        name: "Bose QuiteComfort",
        price: 249,
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas, sequi?",
        stock: 8
      },
      {
        categoryId: "67bb58dbc307f39c722c4fbf",
        image: "/assets/products/pixel-8.png",
        name: "Galaxy Pixel 8",
        price: 549,
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas, sequi?",
        stock: 10
      },
      {
        categoryId: "67bb58dbc307f39c722c4fbf",
        image: "/assets/products/iphone-15.png",
        name: "Apple Iphone 15",
        price: 1299,
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas, sequi?",
        stock: 7
      },
      {
        categoryId: "67bb58dbc307f39c722c4fbe",
        image: "/assets/products/soundlink.png",
        name: "Bose SoundLink",
        price: 119,
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas, sequi?",
        stock: 12
      },
      {
        categoryId: "67bb58dbc307f39c722c4fc0",
        image: "/assets/products/apple-watch.png",
        name: "Apple Watch 9",
        price: 699,
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas, sequi?",
        stock: 0
      }
    ];

    const insertedProducts = await Promise.all(
      productsData.map(async (productData) => {
        // Create Stripe product
        const stripeProduct = await stripe.products.create({
          name: productData.name,
          description: productData.description
        });

        // Create Stripe price
        const stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: productData.price * 100, // Convert to cents
          currency: 'usd'
        });

        // Create MongoDB product
        return await Product.create({
          ...productData,
          stripePriceId: stripePrice.id,
          stripeProductId: stripeProduct.id
        });
      })
    );

    console.log(`✅ Seeded ${insertedProducts.length} products`);

    // Log created products
    insertedProducts.forEach(product => {
      console.log(`📦 Created: ${product.name} (Stock: ${product.stock})`);
      console.log(`   Stripe Product ID: ${product.stripeProductId}`);
      console.log(`   Stripe Price ID: ${product.stripePriceId}`);
    });

    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");

  } catch (error) {
    console.error("❌ Error seeding products:", error);
    process.exit(1);
  }
}

seedProducts();