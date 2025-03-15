import { Request, Response, NextFunction } from "express";
import Product from "../infrastructure/schemas/Product";
import { CreateProductDTO } from "../domain/dto/product";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import mongoose from "mongoose";
import { ZodError } from "zod";

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categoryId = req.query.categoryId as string;
    const query = categoryId && categoryId !== "ALL" ? { categoryId } : {};
    
    const products = await Product.find(query).lean();
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response, 
  next: NextFunction
) => {
  try {
    // Debug logging
    console.log('Create product request:', {
      body: req.body,
      auth: req.auth,
      sessionClaims: req.auth?.sessionClaims,
      role: req.auth?.sessionClaims?.metadata?.role
    });

    try {
      const productData = CreateProductDTO.parse(req.body);
      
      if (!mongoose.Types.ObjectId.isValid(productData.categoryId)) {
        return res.status(400).json({ 
          message: "Invalid category ID format",
          receivedId: productData.categoryId
        });
      }

      const product = await Product.create({
        ...productData,
        price: Number(productData.price),
        stock: Number(productData.stock)
      });

      res.status(201).json(product);
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        return res.status(400).json({
          message: 'Invalid product data',
          errors: validationError.errors
        });
      }
      throw validationError;
    }
  } catch (error) {
    console.error('Product creation failed:', error);
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
    const product = await Product.findById(id);
    
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    res.status(200).json(product);
  } catch (error) {
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
      throw new NotFoundError("Product not found");
    }
    res.status(204).send();
  } catch (error) {
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
    const productData = CreateProductDTO.parse(req.body);
    const product = await Product.findByIdAndUpdate(id, productData, { new: true });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};