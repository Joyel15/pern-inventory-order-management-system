import { createStockMovement, getStockMovements } from "../services/stockMovementService.js";

export async function create(req, res) {
  try {
    const movement = await createStockMovement(req.body, req.user.userId);
    res.status(201).json({ success: true, message: "Stock movement recorded successfully", data: movement });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Something went wrong" });
  }
};


export async function getAll(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await getStockMovements({ page, limit, productId: req.query.productId, type: req.query.type });
    res.status(200).json({ success: true, message: "Stock movements fetched successfully", data: result.movements, pagination: result.pagination });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};