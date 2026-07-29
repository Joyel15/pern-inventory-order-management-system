import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(150),
  sku: z.string().min(2, "SKU is required").max(50),
  description: z.string().max(1000).optional(),
  price: z.number().positive("Price must be greater than 0"),
  quantity: z.number().int().nonnegative("Quantity cannot be negative").optional(),
  categoryId: z.number().int().positive().optional(),
  supplierId: z.number().int().positive().optional(),
});

export const updateProductSchema = createProductSchema.partial();