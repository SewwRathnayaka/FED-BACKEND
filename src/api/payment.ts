import express from "express";
import { 
  handleWebhook, 
  createCheckoutSession,
  retrieveSessionStatus 
} from "../application/payment";
import { isAuthenticated } from "./middleware/authentication-middleware";

export const paymentsRouter = express.Router();

// Raw body parser for webhook
paymentsRouter.post("/webhook", express.raw({ type: 'application/json' }), handleWebhook);

// JSON parser for other routes
paymentsRouter.post("/create-checkout-session", isAuthenticated, createCheckoutSession);
paymentsRouter.get("/session-status", isAuthenticated, retrieveSessionStatus);

