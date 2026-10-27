import { z } from "zod";

export const createSalesOrderSchema = z.object({
  customerId: z.number().int().positive("A valid customer is required"),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive("Quantity must be at least 1"),
      })
    )
    .min(1, "An order must contain at least one item"),
});


export const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"]),
});