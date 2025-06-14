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

// 1. First, add basic middleware
app.use(express.json());
app.use(clerkMiddleware());

// 2. Define allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://fed-storefront-frontend-sewwandi.netlify.app',
  'https://fed-storefront-frontend-sewwandi-dev.netlify.app'
];

// 3. Stripe webhook route (must be before CORS)
app.post(
  "/api/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleWebhook
);

// 4. CORS configuration
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 5. API routes
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payments", paymentsRouter);

// 6. Error handling
app.use(globalErrorHandlingMiddleware);

// 7. Connect to database and start server
connectDB().then(() => {
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}).catch(error => {
  console.error('❌ Database connection failed:', error);
  process.exit(1);
});
