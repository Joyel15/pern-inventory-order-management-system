import {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrderStatus,
} from "../services/purchaseOrderService.js";

export async function create(req, res) {
  try {
    const order = await createPurchaseOrder(req.body, req.user.userId);
    res
      .status(201)
      .json({
        success: true,
        message: "Purchase order created successfully",
        data: order,
      });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({
        success: false,
        message: error.message || "Something went wrong",
      });
  }
}

export async function getAll(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await getPurchaseOrders({
      page,
      limit,
      status: req.query.status,
      supplierId: req.query.supplierId,
    });
    res
      .status(200)
      .json({
        success: true,
        message: "Purchase orders fetched successfully",
        data: result.orders,
        pagination: result.pagination,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
}

export async function getOne(req, res) {
  try {
    const order = await getPurchaseOrderById(parseInt(req.params.id));
    res
      .status(200)
      .json({
        success: true,
        message: "Purchase order fetched successfully",
        data: order,
      });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({
        success: false,
        message: error.message || "Something went wrong",
      });
  }
}

export async function updateStatus(req, res) {
  try {
    const order = await updatePurchaseOrderStatus(
      parseInt(req.params.id),
      req.body.status,
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Order status updated successfully",
        data: order,
      });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({
        success: false,
        message: error.message || "Something went wrong",
      });
  }
}
