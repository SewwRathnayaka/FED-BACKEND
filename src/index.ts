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
import paymentRoutes from "./routes/paymentRoutes";

const app = express();
app.use(express.json()); // For parsing JSON requests
app.use(clerkMiddleware());

const allowedOrigins = [
  'http://localhost:5173',        // Local development
  'http://localhost:3000',        // Alternative local port
  'https://fed-storefront-frontend-sewwandi.netlify.app'  // Production frontend
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/payment", paymentRoutes);

app.use(globalErrorHandlingMiddleware);

connectDB();
const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
});
