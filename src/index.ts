import express from "express";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import "dotenv/config";
import { categoryRouter } from "./api/category";
import globalErrorHandlingMiddleware from "./api/middleware/global-error-handling-middleware";
import { orderRouter } from "./api/order";
import paymentRouter from "./api/payment";
import { productRouter } from "./api/product";
import { connectDB } from "./infrastructure/db";

const app = express();

// Custom CORS middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://fed-storefront-frontend-sewwandi.netlify.app'
  ];
  
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Stripe-Signature');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  
  next();
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path} from origin: ${req.headers.origin}`);
  console.log('Headers:', req.headers);
  next();
});

// Test route to verify CORS
app.get("/api/test", (req, res) => {
  res.json({ message: "CORS is working!" });
});

// Modified Clerk middleware to skip for OPTIONS
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next(); // Skip Clerk for preflight
  }
  return clerkMiddleware()(req, res, next);
});

app.use(express.json());

// API routes
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payments", paymentRouter);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  globalErrorHandlingMiddleware(err, req, res, next);
});

connectDB();
const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
});
