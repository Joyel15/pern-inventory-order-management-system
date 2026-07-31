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
import dashboardRoutes from "./routes/dashboardRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json({ success: true, message: "Inventory Management API is running" });
});

app.use("/auth", authRoutes);
app.use("/categories", categoryRoutes);
app.use("/suppliers", supplierRoutes);
app.use("/products", productRoutes);
app.use("/customers", customerRoutes);
app.use("/sales-orders", salesOrderRoutes);
app.use("/purchase-orders", purchaseOrderRoutes);
app.use("/stock-movements", stockMovementRoutes);
app.use("/users", userRoutes);
app.use("/profile", profileRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/reports", reportRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ success: false, message: err.message || "Internal server error" });
});

export default app;