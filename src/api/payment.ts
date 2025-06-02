import express, { RequestHandler } from "express";
import { 
  handleWebhook, 
  createCheckoutSession,
  retrieveSessionStatus 
} from "../application/payment";
import { isAuthenticated } from "./middleware/authentication-middleware";

export const paymentsRouter = express.Router();

// Important: This must be the first route
paymentsRouter.post(
  "/webhook",
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// JSON parsing middleware for all other routes
paymentsRouter.use(express.json());

paymentsRouter.post(
  "/create-checkout-session", 
  isAuthenticated, 
  createCheckoutSession
);

paymentsRouter.get(
  "/session-status", 
  isAuthenticated, 
  retrieveSessionStatus
);
