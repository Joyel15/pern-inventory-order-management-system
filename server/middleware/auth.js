import jwt from "jsonwebtoken";

export function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
  }

  const token = authHeader.split(" ")[1]; // "Bearer <token>" -> take the part after the space

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = payload; // { userId, role }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, invalid or expired token",
    });
  }
}