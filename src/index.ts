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
app.use(express.json()); // For parsing JSON requests
app.use(clerkMiddleware());

const allowedOrigins = [
  'http://localhost:5173',        // Local development
  'http://localhost:3000',        // Alternative local port
  'https://fed-storefront-frontend-sewwandi.netlify.app'  // Updated production frontend
];
app.post(
  "/api/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleWebhook
);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'] 
}));

app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payments", paymentsRouter);

app.use(globalErrorHandlingMiddleware);

connectDB();
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
