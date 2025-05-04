import { Request, Response } from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-03-31.basil'
});

export const createPaymentIntent = async (req: Request, res: Response) => {
    try {
        const { amount } = req.body;

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: 'Error creating payment intent' });
    }
};

export const getCheckoutSessionStatus = async (req: Request, res: Response) => {
    try {
        const { session_id } = req.query;

        if (!session_id) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(session_id as string);

        res.json({
            status: paymentIntent.status,
            customer_email: paymentIntent.receipt_email,
            orderId: paymentIntent.id,
            orderStatus: 'processing',
            paymentStatus: paymentIntent.status,
        });
    } catch (error) {
        console.error('Error retrieving payment intent:', error);
        res.status(500).json({ error: 'Error retrieving payment status' });
    }
};

export const handleWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !endpointSecret) {
        return res.status(400).send('Missing stripe signature or webhook secret');
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            // Handle successful payment
            console.log('PaymentIntent was successful!');
            // Here you can update your order status in the database
            break;
        case 'payment_method.attached':
            const paymentMethod = event.data.object;
            // Handle payment method attached
            console.log('PaymentMethod was attached to a Customer!');
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
}; 