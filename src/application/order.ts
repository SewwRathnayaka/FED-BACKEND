import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import ValidationError from "../domain/errors/validation-error";
import Order from "../infrastructure/schemas/Order";
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
    const result = CreateOrderDTO.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError(JSON.stringify(result.error.errors));
    }

    const userId = req.auth.userId;

    // Validate products and stock in one query
    const productIds = result.data.items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    
    const productMap = new Map(products.map(p => [p._id.toString(), p]));
    
    result.data.items.forEach(item => {
      const product = productMap.get(item.product);
      if (!product) {
        throw new NotFoundError(`Product ${item.product} not found`);
      }
      if (product.stock < item.quantity) {
        throw new ValidationError(`Insufficient stock for ${product.name}`);
      }
    });

    const address = await Address.create({
      ...result.data.shippingAddress,
      userId,
    });

    const order = await Order.create({
      userId,
      items: result.data.items,
      addressId: address._id,
      orderStatus: "PENDING",
      paymentStatus: "PENDING"
    });

    // Update stock levels in bulk
    await Product.bulkWrite(
      result.data.items.map(item => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { stock: -item.quantity } }
        }
      }))
    );

    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: "items.product",
        select: "name price image description stock"
      })
      .populate("addressId");

    res.status(201).json(populatedOrder);
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("addressId")
      .populate("items.product", "name price image");
      
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
    const orders = await Order.find({ userId: req.auth.userId })
      .populate("addressId")
      .populate("items.product", "name image")
      .sort({ createdAt: -1 });
    
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};
