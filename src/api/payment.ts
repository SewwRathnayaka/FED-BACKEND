import express, { Request, Response, NextFunction, RequestHandler } from "express";
import { handleWebhook } from "../application/payment";
import { createPaymentIntent } from '../infrastructure/stripe';

const router = express.Router();

router.post("/webhook", (req: Request, res: Response, next: NextFunction) => {
  handleWebhook(req, res, next);
});

type PaymentIntentRequest = {
  amount: number;
  currency?: string;
};

const createPaymentIntentHandler: RequestHandler = (req: Request<{}, {}, PaymentIntentRequest>, res: Response, next: NextFunction) => {
    const { amount, currency } = req.body;
    
    if (!amount) {
        res.status(400).json({ error: 'Amount is required' });
        return;
    }

    createPaymentIntent(amount, currency)
        .then(paymentIntent => {
            res.json({
                clientSecret: paymentIntent.client_secret,
            });
        })
        .catch(next);
};

router.post('/create-payment-intent', createPaymentIntentHandler);

export default router;

