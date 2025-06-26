import { Request, Response, NextFunction } from "express";
import util from "util";
import Order from "../infrastructure/schemas/Order";
import stripe from "../infrastructure/stripe";
import NotFoundError from "../domain/errors/not-found-error";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
const FRONTEND_URL = process.env.FRONTEND_URL as string;

async function fulfillCheckout(sessionId: string) {
  // Set your secret key. Remember to switch to your live secret key in production.
  // See your keys here: https://dashboard.stripe.com/apikeys
  console.log("Fulfilling Checkout Session " + sessionId);

  // TODO: Make this function safe to run multiple times,
  // even concurrently, with the same session ID

  // TODO: Make sure fulfillment hasn't already been
  // peformed for this Checkout Session

  // Retrieve the Checkout Session from the API with line_items expanded
  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });
  console.log(
    util.inspect(checkoutSession, false, null, true /* enable colors */)
  );

  const order = await Order.findById(checkoutSession.metadata?.orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  if (order.paymentStatus !== "PENDING") {
    throw new Error("Payment is not pending");
  }

  if (order.orderStatus !== "PENDING") {
    throw new Error("Order is not pending");
  }

  // Check the Checkout Session's payment_status property
  // to determine if fulfillment should be peformed
  if (checkoutSession.payment_status !== "unpaid") {
    // TODO: Perform fulfillment of the line items
    // TODO: Record/save fulfillment status for this
    // Checkout Session
    await Order.findByIdAndUpdate(order._id, {
      paymentStatus: "PAID",
      orderStatus: "CONFIRMED",
    });
  }
}

export const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const orderId = session.metadata.orderId;

      const order = await Order.findById(orderId);
      if (!order) {
        throw new NotFoundError(`Order ${orderId} not found`);
      }

      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'PAID',
        orderStatus: 'CONFIRMED'
      });

      console.log('Order payment confirmed:', orderId);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handling failed:', error);
    next(error);
  }
};

export const createCheckoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.body;
    console.log('Request body:', req.body); // Log entire request body
    console.log('Order ID from request:', orderId);

    if (!orderId) {
      throw new Error('Order ID is required');
    }

    const order = await Order.findById(orderId);
    console.log('Found order:', order); // Log found order
    
    if (!order) {
      console.error('Order not found in database:', orderId);
      throw new NotFoundError(`Order ${orderId} not found`);
    }

    // Validate order items
    if (!order.items || order.items.length === 0) {
      console.error('Order has no items:', orderId);
      throw new Error('Order has no items');
    }

    // Log order details before creating session
    console.log('Creating Stripe session for order:', {
      id: order._id,
      items: order.items.map(item => ({
        productId: item.product._id,
        stripePriceId: item.product.stripePriceId,
        quantity: item.quantity
      }))
    });

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: order.items.map((item) => ({
        price: item.product.stripePriceId,
        quantity: item.quantity,
      })),
      mode: "payment",
      return_url: `${process.env.FRONTEND_URL}/shop/complete?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        orderId: order._id.toString(), // Ensure orderId is a string
      },
    });

    console.log('Checkout session created successfully:', {
      sessionId: session.id,
      clientSecret: session.client_secret
    });

    res.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error('Checkout session creation failed:', {
      error: error.message,
      stack: error.stack
    });
    next(error);
  }
};

export const retrieveSessionStatus = async (req: Request, res: Response) => {
  const checkoutSession = await stripe.checkout.sessions.retrieve(
    req.query.session_id as string
  );

  const order = await Order.findById(checkoutSession.metadata?.orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  res.status(200).json({
    orderId: order._id,
    status: checkoutSession.status,
    customer_email: checkoutSession.customer_details?.email,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
  });
};