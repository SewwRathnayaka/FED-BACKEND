import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import ValidationError from "../domain/errors/validation-error";
import Order from "../infrastructure/schemas/Order";
import { getAuth } from "@clerk/express";
import NotFoundError from "../domain/errors/not-found-error";
import Address from "../infrastructure/schemas/Address";
import { CreateOrderDTO } from "../domain/dto/order";
import Product from "../infrastructure/schemas/Product";
import mongoose from "mongoose";

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Debug log
    console.log('Received order data:', JSON.stringify(req.body, null, 2));

    const result = CreateOrderDTO.safeParse(req.body);
    if (!result.success) {
      console.error('Validation errors:', result.error.errors);
      throw new ValidationError(JSON.stringify(result.error.errors));
    }

    const userId = req.auth.userId;

    // Validate each item's product ID format
    for (const item of result.data.items) {
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        throw new ValidationError(`Invalid product ID format: ${item.product}`);
      }
      
      const product = await Product.findById(item.product);
      if (!product) {
        throw new NotFoundError(`Product ${item.product} not found`);
      }
      if (product.stock < item.quantity) {
        throw new ValidationError(`Insufficient stock for ${product.name}`);
      }
    }

    // Create address
    const address = await Address.create({
      ...result.data.shippingAddress,
      userId,
    });

    // Create order with validated data
    const order = await Order.create({
      userId,
      items: result.data.items,
      addressId: address._id,
      orderStatus: "PENDING",
      paymentStatus: "PENDING"
    });

    // Update stock levels
    await Promise.all(result.data.items.map(async (item) => {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
    }));

    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: "items.product",
        model: "Product",
        select: "name price image description stock"
      })
      .populate({
        path: "addressId",
        model: "Address"
      });

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error("Error creating order:", {
      error,
      body: req.body,
      validation: error instanceof ValidationError ? error.message : null
    });
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
    const order = await Order.findById(id).populate({
      path: "addressId",
      model: "Address",
    }).populate({
      path:"items."
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
    console.log("Auth object:", req.auth); // Debug auth
    const userId = req.auth.userId;
    console.log("UserID:", userId); // Debug userId

    const orders = await Order.find({ userId });
    console.log("Found orders:", orders); // Debug orders

    const populatedOrders = await Order.find({ userId })
      .populate({
        path: "addressId",
        model: "Address",
      })
      .populate({
        path: "items.product",
        model: "Product",
        select: "name image" // Ensure image is selected
      });
    console.log("Populated orders:", populatedOrders); // Debug populated orders
    
    res.status(200).json(populatedOrders);
  } catch (error) {
    console.error("Error in getUserOrders:", error); // Debug errors
    next(error);
  }
};
