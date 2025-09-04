import { z } from "zod";

export const CreateProductDTO = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  stock: z.number(),
  categoryId: z.string(),
  image: z.string()
});
