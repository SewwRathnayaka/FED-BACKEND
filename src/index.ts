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

// Debug middleware
app.use((req, res, next) => {
  console.log('🔄 Incoming request:', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin
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
    
    // Allow requests with no origin (like mobile apps)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error('❌ Blocked origin:', origin);
    return callback(new Error('CORS not allowed'));
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
  exposedHeaders: ['Content-Range']
}));

// Webhook route before JSON parsing
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

// Regular middleware
app.use(express.json());
app.use(clerkMiddleware());

// API routes
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payments", paymentsRouter);

// Error handling
app.use(globalErrorHandlingMiddleware);

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
