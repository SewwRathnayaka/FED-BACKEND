import express, { RequestHandler } from "express";
import { 
  handleWebhook, 
  createCheckoutSession,
  retrieveSessionStatus 
} from "../application/payment";
import { isAuthenticated } from "./middleware/authentication-middleware";

const router = express.Router();

// Important: This must be the first route
router.post(
  "/webhook",
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// JSON parsing middleware for all other routes
router.use(express.json());

router.post(
  "/create-checkout-session", 
  isAuthenticated, 
  createCheckoutSession
);

// Add this to handle preflight OPTIONS requests:
router.options("/create-checkout-session", (req, res) => {
  res.sendStatus(204);
});

router.get(
  "/session-status", 
  isAuthenticated, 
  retrieveSessionStatus
);

export { router as paymentsRouter };

