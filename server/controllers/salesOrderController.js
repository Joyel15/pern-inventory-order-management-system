import {
  createSalesOrder,
  getSalesOrders,
  getSalesOrderById,
  updateSalesOrderStatus,
} from "../services/salesOrderService.js";

export async function create(req, res) {
  try {
    const order = await createSalesOrder(req.body, req.user.userId);
    res
      .status(201)
      .json({
        success: true,
        message: "Sales order created successfully",
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
    const status = req.query.status;
    const customerId = req.query.customerId;

    const result = await getSalesOrders({ page, limit, status, customerId });

    res.status(200).json({
      success: true,
      message: "Sales orders fetched successfully",
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
}

export async function getOne(req, res) {
  try {
    const id = parseInt(req.params.id);
    const order = await getSalesOrderById(id);
    res
      .status(200)
      .json({
        success: true,
        message: "Sales order fetched successfully",
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
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const order = await updateSalesOrderStatus(id, status);
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
