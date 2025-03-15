import { NextFunction, Request, Response } from "express";
import { CreateCategoryDTO } from "../domain/dto/category";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import Category from "../infrastructure/schemas/Category";

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await Category.find();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = CreateCategoryDTO.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError("Invalid category data");
    }

    const category = await Category.create(result.data);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;
    const category = await Category.findById(id);
    
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      throw new NotFoundError("Category not found");
    }
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;
    const result = CreateCategoryDTO.safeParse(req.body);
    
    if (!result.success) {
      throw new ValidationError("Invalid category data");
    }

    const category = await Category.findByIdAndUpdate(id, result.data, { new: true });

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
};
