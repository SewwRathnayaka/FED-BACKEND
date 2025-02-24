import express from "express";
import { createOrder, getOrder, getUserOrders } from "../application/order";
import { isAuthenticated } from "./middleware/authentication-middleware";

export const orderRouter = express.Router();  // Add this line

orderRouter.route("/").post(isAuthenticated, createOrder);
orderRouter.route("/user/orders").get(isAuthenticated, getUserOrders);
orderRouter.route("/:id").get(isAuthenticated, getOrder);