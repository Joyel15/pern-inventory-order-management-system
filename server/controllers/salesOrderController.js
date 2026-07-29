import { createSalesOrder } from "../services/salesOrderService.js";

export async function create(req, res) {
  try {
    const order = await createSalesOrder(req.body, req.user.userId);
    res.status(201).json({ success: true, message: "Sales order created successfully", data: order });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Something went wrong" });
  }
};