import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Parses incoming JSON request bodies into req.body.
// Without this, req.body would be undefined on POST/PUT requests.
app.use(express.json());

// Allows your React frontend (running on a different port)
// to make requests to this API. We'll configure allowed
// origins properly once the frontend exists — permissive
// for now during backend-only development.
app.use(cors());

// A simple health-check route — useful for confirming
// the server is alive before any real routes exist.
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Inventory Management API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});