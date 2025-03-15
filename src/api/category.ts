import express, { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from "../application/category";
import { isAuthenticated } from "./middleware/authentication-middleware";
import { isAdmin } from "./middleware/authorization-middleware";

export const categoryRouter: Router = express.Router();

categoryRouter
  .route("/")
  .get(getCategories)
  .post(isAuthenticated, isAdmin, createCategory);

categoryRouter
  .route("/:id")
  .get(getCategory)
  .delete(isAuthenticated, isAdmin, deleteCategory)
  .patch(isAuthenticated, isAdmin, updateCategory);
