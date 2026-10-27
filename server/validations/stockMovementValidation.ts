import { z } from "zod";

export const createStockMovementSchema = z.object({
  productId: z.number().int().positive("A valid product is required"),
  type: z.enum(["STOCK_IN", "STOCK_OUT"]),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  reason: z.string().max(255).optional(),
});