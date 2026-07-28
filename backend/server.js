import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(express.json());

// Allows your React frontend (running on a different port)
// to make requests to this API. We'll configure allowed
// origins properly once the frontend exists — permissive
// for now during backend-only development.
app.use(cors());

app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});