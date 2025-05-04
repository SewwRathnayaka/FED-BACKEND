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

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${req.method}] request from origin: ${req.headers.origin}`);
  next();
});

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://fed-storefront-frontend-sewwandi.netlify.app'
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

console.log('CORS configuration applied');
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

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

app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payments", paymentRouter);

// Ensure CORS headers are preserved in error responses
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin as string)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  globalErrorHandlingMiddleware(err, req, res, next);
});

connectDB();
const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
});
