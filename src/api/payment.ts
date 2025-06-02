import express from "express";
import { createCheckoutSession, handleWebhook } from "../application/payment";
import { isAuthenticated } from "./middleware/authentication-middleware";

export const paymentsRouter = express.Router();

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
