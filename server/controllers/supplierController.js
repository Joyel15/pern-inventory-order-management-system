import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../services/supplierService.js";


export async function getAll(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const result = await getSuppliers({ page, limit, search });

    res.status(200).json({
      success: true,
      message: "Suppliers fetched successfully",
      data: result.suppliers,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


export async function create(req, res) {
  try {
    const supplier = await createSupplier(req.body, req.user.userId);
    res.status(201).json({ success: true, message: "Supplier created successfully", data: supplier });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Something went wrong" });
  }
};


export async function update(req, res) {
  try {
    const id = parseInt(req.params.id);
    const supplier = await updateSupplier(id, req.body);
    res.status(200).json({ success: true, message: "Supplier updated successfully", data: supplier });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Something went wrong" });
  }
};


export async function remove(req, res) {
  try {
    const id = parseInt(req.params.id);
    await deleteSupplier(id);
    res.status(200).json({ success: true, message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Something went wrong" });
  }
};