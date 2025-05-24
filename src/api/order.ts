import express from "express";
import { createOrder, getOrder, getUserOrders } from "../application/order";
import { isAuthenticated } from "./middleware/authentication-middleware";

export const orderRouter = express.Router();

// Specific routes must come before parameterized routes
orderRouter.get("/user/orders", isAuthenticated, getUserOrders);  // This must be first
orderRouter.post("/", isAuthenticated, createOrder);
orderRouter.get("/:id", isAuthenticated, getOrder);