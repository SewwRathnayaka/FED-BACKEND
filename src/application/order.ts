import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import ValidationError from "../domain/errors/validation-error";
import Order from "../infrastructure/schemas/Order";
import { getAuth } from "@clerk/express";
import NotFoundError from "../domain/errors/not-found-error";
import Address from "../infrastructure/schemas/Address";
import { CreateOrderDTO } from "../domain/dto/order";

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = CreateOrderDTO.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError("Invalid order data");
    }

    const userId = req.auth.userId;

    const address = await Address.create({
      ...result.data.shippingAddress,
      userId,
    });

    const items = result.data.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity
    }));

    const order = await Order.create({
      userId,
      items,
      addressId: address._id,
    });

    console.log("Created order:", order);

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
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
