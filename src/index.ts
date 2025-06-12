import express from "express";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import "dotenv/config";
import { categoryRouter } from "./api/category";
import globalErrorHandlingMiddleware from "./api/middleware/global-error-handling-middleware";
import { orderRouter } from "./api/order";
import { paymentsRouter } from "./api/payment";
import { productRouter } from "./api/product";
import { connectDB } from "./infrastructure/db";
import { handleWebhook } from "./application/payment";
import bodyParser from "body-parser";

const app = express();

// Wrap the server setup in an async IIFE
(async () => {
  try {
    // Debug middleware
    app.use((req, res, next) => {
      console.log('🔄 Incoming request:', {
        method: req.method,
        path: req.path,
        origin: req.headers.origin,
        headers: req.headers
      });
      next();
    });

    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://fed-storefront-frontend-sewwandi.netlify.app',
      'https://fed-storefront-frontend-sewwandi-dev.netlify.app'
    ];

    // CORS configuration
    app.use(cors({
      origin: function(origin, callback) {
        console.log('🔍 Request origin:', origin);
        
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        console.error('❌ Blocked origin:', origin);
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin'
      ],
      preflightContinue: false,
      optionsSuccessStatus: 204
    }));

    // Health check endpoint (no auth required)
    app.get('/health', (req, res) => {
      res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      });
    });

    // Connect to database first
    await connectDB();

    // Webhook route (before body parsing)
    app.post(
      "/api/stripe/webhook",
      express.raw({ type: "application/json" }),
      handleWebhook
    );

    // Regular middleware
    app.use(express.json());
    app.use(clerkMiddleware());

    // API routes with /api prefix
    app.use("/api/products", productRouter);
    app.use("/api/categories", categoryRouter);
    app.use("/api/orders", orderRouter);
    app.use("/api/payments", paymentsRouter);

    // Error handling
    app.use(globalErrorHandlingMiddleware);

    // Start server
    const PORT = process.env.PORT || 10000;
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log('👉 Allowed origins:', allowedOrigins);
    });

  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
})();
