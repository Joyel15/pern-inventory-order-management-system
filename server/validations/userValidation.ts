import { z } from "zod";

export const updateUserSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "STAFF"]).optional(),
  isActive: z.boolean().optional(),
});