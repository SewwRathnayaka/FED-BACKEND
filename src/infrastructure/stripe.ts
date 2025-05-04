import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
    typescript: true,
});

const MIN_AMOUNT = 50; // Minimum amount in cents
const MAX_AMOUNT = 1000000; // Maximum amount in cents

export const createPaymentIntent = async (amount: number, currency: string = 'usd') => {
    try {
        // Validate amount
        const amountInCents = Math.round(amount * 100);
        if (amountInCents < MIN_AMOUNT) {
            throw new Error(`Amount must be at least ${MIN_AMOUNT / 100} ${currency}`);
        }
        if (amountInCents > MAX_AMOUNT) {
            throw new Error(`Amount must be less than ${MAX_AMOUNT / 100} ${currency}`);
        }

        // Validate currency
        const validCurrencies = ['usd', 'eur', 'gbp'];
        if (!validCurrencies.includes(currency.toLowerCase())) {
            throw new Error(`Currency ${currency} is not supported`);
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: currency.toLowerCase(),
            automatic_payment_methods: {
                enabled: true,
            },
        });

        console.log(`Created payment intent: ${paymentIntent.id}`);
        return paymentIntent;
    } catch (error) {
        console.error('Error creating payment intent:', error);
        if (error instanceof Stripe.errors.StripeError) {
            throw new Error(`Stripe error: ${error.message}`);
        }
        throw error;
    }
};