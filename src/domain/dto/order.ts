import { z } from "zod";

export const CreateOrderDTO = z.object({
  items: z.array(
    z.object({
      product: z.string(),  // MongoDB ID string
      quantity: z.number().min(1)
    })
  ),
  shippingAddress: z.object({
    line_1: z.string(),
    line_2: z.string(),
    city: z.string(),
    state: z.string(),
    zip_code: z.string(),
    phone: z.string()
  })
}).strict(); // Add strict() to ensure no extra properties
