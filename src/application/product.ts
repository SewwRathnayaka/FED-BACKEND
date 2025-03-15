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
): Promise<void> => {
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
): Promise<void> => {
  try {
    const productData = CreateProductDTO.parse(req.body);
    
    if (!mongoose.Types.ObjectId.isValid(productData.categoryId)) {
      res.status(400).json({ 
        message: "Invalid category ID format",
        receivedId: productData.categoryId
      });
      return;
    }

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
): Promise<void> => {
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
): Promise<void> => {
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