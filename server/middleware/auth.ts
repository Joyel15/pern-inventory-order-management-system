import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { JWT_ACCESS_SECRET } from "../config/env.js";

interface AccessTokenPayload {
  userId: number;
  role: Role;
}

export function protect(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
    return;
  }

  const token = authHeader.split(" ")[1]; // "Bearer <token>" -> take the part after the space

  try {
    const payload = jwt.verify(token, JWT_ACCESS_SECRET) as AccessTokenPayload;
    req.user = payload; // { userId, role }
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Not authorized, invalid or expired token",
    });
  }
}
