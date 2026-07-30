import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import salesOrderRoutes from "./routes/salesOrderRoutes.js";
import purchaseOrderRoutes from "./routes/purchaseOrderRoutes.js";
import stockMovementRoutes from "./routes/stockMovementRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

const app = express();

app.use(express.json());

// Allows your React frontend (running on a different port)
// to make requests to this API. We'll configure allowed
// origins properly once the frontend exists — permissive
// for now during backend-only development.
app.use(cors());

app.use("/auth", authRoutes);
app.use("/categories", categoryRoutes);
app.use("/suppliers",supplierRoutes);
app.use("/products", productRoutes);
app.use("/customers", customerRoutes);
app.use("/sales-orders", salesOrderRoutes);
app.use("/purchase-orders", purchaseOrderRoutes);
app.use("/stock-movements", stockMovementRoutes);
app.use("/users", userRoutes);
app.use("/profile", profileRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});