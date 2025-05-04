import express from "express";
import { handleWebhook } from "../application/payment";
import { createPaymentIntent } from '../infrastructure/stripe';

export const paymentsRouter = express.Router();

paymentsRouter.route("/webhook").post(handleWebhook);

const router = express.Router();

router.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency } = req.body;
        
        if (!amount) {
            return res.status(400).json({ error: 'Amount is required' });
        }

        const paymentIntent = await createPaymentIntent(amount, currency);
        
        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Error in payment intent creation:', error);
        res.status(500).json({ error: 'Failed to create payment intent' });
    }
});

export default router;

