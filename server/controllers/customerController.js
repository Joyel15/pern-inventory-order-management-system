import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../services/customerService.js";

export async function getAll(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const result = await getCustomers({ page, limit, search });

    res.status(200).json({
      success: true,
      message: "Customers fetched successfully",
      data: result.customers,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


export async function create(req, res) {
  try {
    const customer = await createCustomer(req.body, req.user.userId);
    res.status(201).json({ success: true, message: "Customer created successfully", data: customer });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Something went wrong" });
  }
};


export async function update(req, res) {
  try {
    const id = parseInt(req.params.id);
    const customer = await updateCustomer(id, req.body);
    res.status(200).json({ success: true, message: "Customer updated successfully", data: customer });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Something went wrong" });
  }
};


export async function remove(req, res) {
  try {
    const id = parseInt(req.params.id);
    await deleteCustomer(id);
    res.status(200).json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Something went wrong" });
  }
};