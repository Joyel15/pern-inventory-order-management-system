import { registerUser } from "../services/authService.js";

export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    const user = await registerUser({ name, email, password, role });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });

  } catch (error) {
    // If the service attached a statusCode (like our 409 for
    // duplicate email), use it. Otherwise default to 500 —
    // an unexpected server-side failure.
    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}