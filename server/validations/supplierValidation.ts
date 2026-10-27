import { z } from "zod";

export const createSupplierSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  contactPerson: z.string().max(100).optional(),
  email: z.string().email("Please provide a valid email address").optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(255).optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial();
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
