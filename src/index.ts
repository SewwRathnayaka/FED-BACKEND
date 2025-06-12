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

// Define CORS options
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://fed-storefront-frontend-sewwandi.netlify.app',
    'https://fed-storefront-frontend-sewwandi-dev.netlify.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// 1. Request logging
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path} from ${req.headers.origin}`);
  next();
});

// 2. Enable CORS - must be before other middleware
app.use(cors(corsOptions));

// 3. Handle OPTIONS requests explicitly
app.options('*', cors(corsOptions));

// 4. Webhook route (must be before body parsing)
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

// 5. Regular middleware
app.use(express.json());
app.use(clerkMiddleware());

// 6. API routes
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payments", paymentsRouter);

// 7. Error handling
app.use(globalErrorHandlingMiddleware);

// 8. Start server
connectDB();
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
