import { Request, Response, RequestHandler, NextFunction } from "express";
import util from "util";
import Order, { IOrder } from "../infrastructure/schemas/Order";
import Product from "../infrastructure/schemas/Product";
import stripe from "../infrastructure/stripe";
import mongoose from "mongoose";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
const FRONTEND_URL = process.env.FRONTEND_URL as string;

async function fulfillCheckout(sessionId: string) {
  try {
    console.log("🔄 Starting fulfillment for session:", sessionId);
    
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"]
    });
    console.log("✅ Retrieved checkout session:", checkoutSession.id);

    const order = await Order.findById(checkoutSession.metadata?.orderId);
    if (!order) {
      console.error("❌ Order not found for session:", sessionId);
      throw new Error("Order not found");
    }

    console.log("📦 Found order:", order._id);
    console.log("💳 Payment status:", checkoutSession.payment_status);
    console.log("🛍️ Order status:", order.orderStatus);
    console.log("📝 Order items:", JSON.stringify(order.items, null, 2));

    if (checkoutSession.payment_status === "paid" && order.orderStatus === "PENDING") {
      const session = await mongoose.startSession();
      session.startTransaction();
      console.log("🔄 Started MongoDB transaction");

      try {
        for (const item of order.items) {
          const product = await Product.findById(item.product._id);
          if (!product) {
            throw new Error(`Product not found: ${item.product._id}`);
          }

          console.log(`📦 Processing item: ${product.name}`);
          console.log(`Current stock: ${product.stock}, Reducing by: ${item.quantity}`);

          const updatedStock = product.stock - item.quantity;
          if (updatedStock < 0) {
            throw new Error(`Insufficient stock for ${product.name}`);
          }

          await Product.findByIdAndUpdate(
            product._id,
            { $set: { stock: updatedStock } },
            { session }
          );

          console.log(`✅ Updated stock for ${product.name}: ${updatedStock}`);
        }

        await Order.findByIdAndUpdate(
          order._id,
          {
            paymentStatus: "PAID",
            orderStatus: "CONFIRMED"
          },
          { session }
        );
        console.log("✅ Updated order status to CONFIRMED");

        await session.commitTransaction();
        console.log("✅ Transaction committed successfully");
      } catch (error) {
        console.error("❌ Error in transaction:", error);
        await session.abortTransaction();
        console.log("⚠️ Transaction aborted");
        throw error;
      } finally {
        session.endSession();
        console.log("👋 Session ended");
      }
    } else {
      console.log("⏭️ Skipping fulfillment - payment not completed or order already processed");
    }
  } catch (error) {
    console.error("❌ Error in fulfillCheckout:", error);
    throw error;
  }
}

export const createCheckoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      res.status(400).json({ error: 'orderId is required' });
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      ui_mode: 'embedded',
      line_items: order.items.map(item => ({
        price: item.product.stripePriceId,
        quantity: item.quantity
      })),
      metadata: {
        orderId: orderId.toString()
      },
      return_url: `${process.env.FRONTEND_URL}/shop/complete?session_id={CHECKOUT_SESSION_ID}`
    });

    res.status(200).json({ clientSecret: session.client_secret });
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (
  req: Request, 
  res: Response
): Promise<void> => {
  const sig = req.headers["stripe-signature"] as string;

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      await fulfillCheckout(session.id);
    }

    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

export const retrieveSessionStatus: RequestHandler = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(
      req.query.session_id as string
    );

    const order = await Order.findById(checkoutSession.metadata?.orderId);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // If payment is complete but order status hasn't been updated
    if (checkoutSession.payment_status === "paid" && order.paymentStatus === "PENDING") {
      const updatedOrder = await Order.findByIdAndUpdate(
        order._id,
        {
          paymentStatus: "PAID",
          orderStatus: "CONFIRMED"
        },
        { new: true }
      ) as IOrder;

      res.status(200).json({
        orderId: updatedOrder._id,
        status: checkoutSession.status,
        customer_email: checkoutSession.customer_details?.email,
        orderStatus: updatedOrder.orderStatus,
        paymentStatus: updatedOrder.paymentStatus,
      });
      return;
    }

    res.status(200).json({
      orderId: order._id,
      status: checkoutSession.status,
      customer_email: checkoutSession.customer_details?.email,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
    });
  } catch (error: any) {
    console.error('Error retrieving session status:', error);
    next(error);
  }
};