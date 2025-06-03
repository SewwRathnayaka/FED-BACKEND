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

// Enhanced request logging
app.use((req, res, next) => {
  console.log('🔄 Request:', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    headers: req.headers
  });
  next();
});

const allowedOrigins = [
  // Local development
  'http://localhost:5173',
  'http://localhost:3000',
  // Production URLs
  'https://fed-storefront-frontend-sewwandi.netlify.app',
  'https://fed-storefront-frontend-sewwandi-dev.netlify.app'
];

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    console.log('🔍 Checking origin:', origin);
    
    if (!origin || allowedOrigins.includes(origin)) {
      console.log('✅ Origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('❌ Origin blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Handle preflight requests
app.options('*', cors(corsOptions));

// Apply CORS to all routes
app.use(cors(corsOptions));

// Webhook route (before body parsing)
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

app.use(globalErrorHandlingMiddleware);

// Start server
connectDB();
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
