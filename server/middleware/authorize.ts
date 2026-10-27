import type { Request, Response, NextFunction } from "express";
import type { Role } from "@prisma/client";

// Usage: authorize("ADMIN") or authorize("ADMIN", "MANAGER")
// Must run AFTER protect — it depends on req.user already being set.
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      // Defensive check — this should never trigger if routes
      // are wired correctly (protect always runs first), but
      // it's a cheap safeguard against a wiring mistake.
      res.status(401).json({
        success: false,
        message: "Not authorized, please log in",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
      return;
    }

    next();
  };
}
