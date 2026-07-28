import { registerUser , loginUser , refreshAccessToken , logoutUser } from "../services/authService.js";

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
};


export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const result = await loginUser({ email, password });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });

  } catch (error) {
    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};


export async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;

    const result = await refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      message: "Access token refreshed",
      data: result,
    });

  } catch (error) {
    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};


export async function logout(req, res) {
  try {
    const { refreshToken } = req.body;

    const result = await logoutUser(refreshToken);

    res.status(200).json({
      success: true,
      message: result.message,
    });

  } catch (error) {
    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};