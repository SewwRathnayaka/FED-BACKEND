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

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  try {
    console.log("🔄 Webhook received at:", new Date().toISOString());
    console.log("📝 Webhook Headers:", JSON.stringify(req.headers, null, 2));
    console.log("📦 Raw Body:", req.body);
    
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log("✅ Webhook signature verified");
    console.log("🎯 Event Type:", event.type);
    console.log("📄 Event Data:", JSON.stringify(event.data.object, null, 2));

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("💫 Starting fulfillment for session:", session.id);
      await fulfillCheckout(session.id);
      console.log("✅ Fulfillment completed for session:", session.id);
    }

    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error("❌ Webhook Error:", err.message);
    console.error("Stack:", err.stack);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

export const createCheckoutSession: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { orderId } = req.body;
  
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ error: `Order not found: ${orderId}` });
      return;
    }

    console.log('Creating checkout session with items:', order.items);

    // Ensure line_items is properly formatted as an array
    const lineItems = order.items.map(item => ({
      price: item.product.stripePriceId,
      quantity: item.quantity
    }));

    console.log('Formatted line items:', lineItems);

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: lineItems, // Now properly formatted as array
      mode: "payment",
      return_url: `${FRONTEND_URL}/shop/complete?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        orderId: orderId
      }
    });

    res.json({ clientSecret: session.client_secret });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    next(error);
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