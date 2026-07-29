import { z } from "zod";

export const createPurchaseOrderSchema = z.object({
  supplierId: z.number().int().positive("A valid supplier is required"),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive("Quantity must be at least 1"),
        cost: z.number().positive("Cost must be greater than 0"),
      })
    )
    .min(1, "A purchase order must contain at least one item"),
});

export const updatePOStatusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"]),
});