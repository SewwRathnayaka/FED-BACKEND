import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import Product from "../infrastructure/schemas/Product";

// Load Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categoryId } = req.query;
    if (!categoryId) {
      const data = await Product.find();
      res.status(200).json(data);
      return;
    }

    const data = await Product.find({ categoryId });
    res.status(200).json(data);
    return;
  } catch (error: any) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, price, image, categoryId, stock } = req.body;

    // 1. Create product on Stripe
    const stripeProduct = await stripe.products.create({
      name,
      description,
      images: [image],
    });

    // 2. Create price on Stripe
    const stripePrice = await stripe.prices.create({
      unit_amount: Math.round(price * 100), // Stripe requires cents
      currency: "usd", // or req.body.currency if dynamic
      product: stripeProduct.id,
    });

    // 3. Save to MongoDB
    const newProduct = new Product({
      name,
      description,
      price,
      image,
      stock,
      categoryId,
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id,
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      message: "Product created successfully",
      product: savedProduct,
    });
  } catch (error: any) {
    console.error("❌ [BACKEND] Product creation error:", error);
    next(error);
  }
};

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id).populate("categoryId");
    if (!product) {
      // throw new NotFoundError("Product not found");
      // Use error middleware to handle status
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.status(200).json(product);
  } catch (error: any) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      // throw new NotFoundError("Product not found");
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.status(204).send();
  } catch (error: any) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const product = await Product.findByIdAndUpdate(id, req.body, { new: true });

    if (!product) {
      // throw new NotFoundError("Product not found");
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.status(200).json(product);
  } catch (error: any) {
    next(error);
  }
};