// Usage: authorize("ADMIN") or authorize("ADMIN", "MANAGER")
// Must run AFTER protect — it depends on req.user already being set.
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      // Defensive check — this should never trigger if routes
      // are wired correctly (protect always runs first), but
      // it's a cheap safeguard against a wiring mistake.
      return res.status(401).json({
        success: false,
        message: "Not authorized, please log in",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};