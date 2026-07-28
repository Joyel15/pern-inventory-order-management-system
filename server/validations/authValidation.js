import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters"),

  email: z
    .string()
    .email("Please provide a valid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),

  /*  role is optional on registration — if omitted, Prisma's
  @default(STAFF) takes over. If provided, it must be one
   of the three valid enum values, not arbitrary text. */
  role: z.enum(["ADMIN", "MANAGER", "STAFF"]).optional(),
});


export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});