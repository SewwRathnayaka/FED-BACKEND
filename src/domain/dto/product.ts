import { z } from "zod";

export const CreateProductDTO = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be positive"),
  stock: z.number().min(0, "Stock must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  image: z.string().min(1, "Image URL is required")
}).strict();
