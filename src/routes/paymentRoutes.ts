import express from 'express';
import { createPaymentIntent, handleWebhook, getCheckoutSessionStatus } from '../controllers/paymentController';

const router = express.Router();

// Create payment intent
router.post('/create-payment-intent', (req, res) => {
    createPaymentIntent(req, res).catch(console.error);
});

// Get checkout session status
router.get('/checkout-session-status', (req, res) => {
    getCheckoutSessionStatus(req, res).catch(console.error);
});

// Handle Stripe webhooks
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    handleWebhook(req, res).catch(console.error);
});

export default router; 