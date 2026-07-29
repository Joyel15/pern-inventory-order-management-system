import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(150),
  email: z.string().email("Please provide a valid email address").optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(255).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();