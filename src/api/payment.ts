import express, { Request, Response, NextFunction, RequestHandler } from "express";
import { handleWebhook } from "../application/payment";
import { createPaymentIntent } from '../infrastructure/stripe';

const router = express.Router();

// Rate limiting middleware
const rateLimit = (req: Request, res: Response, next: NextFunction) => {
  // Implement rate limiting logic here
  next();
};

router.post("/webhook", (req: Request, res: Response, next: NextFunction) => {
  handleWebhook(req, res, next);
});

type PaymentIntentRequest = {
  amount: number;
  currency?: string;
};

const createPaymentIntentHandler: RequestHandler = (req: Request<{}, {}, PaymentIntentRequest>, res: Response, next: NextFunction) => {
    const { amount, currency } = req.body;
    
    if (!amount || typeof amount !== 'number' || amount <= 0) {
        res.status(400).json({ error: 'Valid amount is required' });
        return;
    }

    createPaymentIntent(amount, currency)
        .then(paymentIntent => {
            console.log(`Payment intent created for amount: ${amount} ${currency || 'usd'}`);
            res.json({
                clientSecret: paymentIntent.client_secret,
            });
        })
        .catch(error => {
            console.error('Payment intent creation failed:', error);
            next(error);
        });
};

router.post('/create-payment-intent', rateLimit, createPaymentIntentHandler);

export default router;

