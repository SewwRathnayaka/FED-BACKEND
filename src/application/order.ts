import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import ValidationError from "../domain/errors/validation-error";
import Order from "../infrastructure/schemas/Order";
import { getAuth } from "@clerk/express";
import NotFoundError from "../domain/errors/not-found-error";
import Address from "../infrastructure/schemas/Address";
import { CreateOrderDTO } from "../domain/dto/order";
import Product from "../infrastructure/schemas/Product";

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("🔄 Creating new order...");
    console.log("📥 ############################################");

    // Get userId from Clerk auth
    const { userId } = getAuth(req);
    if (!userId) {
      throw new ValidationError("User not authenticated");
    }

    console.log("👤 User ID:", userId);
    console.log("📦 Order items:", req.body.items);

    const result = CreateOrderDTO.safeParse(req.body);
    if (!result.success) {
      console.error("❌ Invalid order data:", result.error);
      throw new ValidationError("Invalid order data");
    }

    // Check stock availability for all items
    await Promise.all(
      result.data.items.map(async (item) => {
        console.log("🔍 Checking stock for item:", item.product._id);
        const product = await Product.findById(item.product._id);

        if (!product) {
          console.error("❌ Product not found:", item.product._id);
          throw new Error(`Product not found: ${item.product._id}`);
        }

        console.log(
          "📦 Current stock:",
          product.stock,
          "Requested:",
          item.quantity
        );
        if (product.stock < item.quantity) {
          console.error("❌ Insufficient stock for", product.name);
          throw new ValidationError(
            `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
          );
        }
      })
    );

    // Create address and order
    const address = await Address.create({
      ...result.data.shippingAddress,
    });

    const items = await Promise.all(
      result.data.items.map(async (item) => {
        const product = await Product.findById(item.product._id);
        if (!product) {
          throw new Error(`Product not found: ${item.product._id}`);
        }
        if (!product.stripePriceId) {
          throw new Error(`Product ${product._id} missing stripePriceId`);
        }

        return {
          product: {
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            description: product.description,
            stripePriceId: product.stripePriceId, // Make sure this is included
          },
          quantity: item.quantity,
        };
      })
    );

    console.log(items);

    const order = await Order.create({
      userId, // Now userId is properly defined
      items,
      addressId: address._id,
    });

    res.status(201).json({ orderId: order._id });
  } catch (error) {
    console.error("❌ Order creation error:", error);
    next(error);
  }
};

export const getOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const order = await Order.findById(id)
      .populate({
        path: "addressId",
        model: "Address",
      })
      .populate({
        path: "items.",
      });
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("📥 GET /user/orders called");
    const { userId } = getAuth(req);
    
    console.log("🔑 Auth check:", {
      userId,
      headers: req.headers,
    });

    if (!userId) {
      throw new ValidationError("User not authenticated");
    }

    const orders = await Order.find({ userId })
      .populate({
        path: "addressId",
        model: "Address"
      })
      .sort({ createdAt: -1 });

    console.log(`📦 Found ${orders.length} orders for user ${userId}`);
    res.status(200).json(orders);

  } catch (error) {
    console.error("❌ Error in getUserOrders:", error);
    next(error);
  }
};