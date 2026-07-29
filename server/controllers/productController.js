import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService.js";

export async function getAll(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const categoryId = req.query.categoryId;
    const supplierId = req.query.supplierId;

    const result = await getProducts({ page, limit, search, categoryId, supplierId });

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


export async function create(req, res) {
  try {
    const product = await createProduct(req.body, req.user.userId);
    res.status(201).json({ success: true, message: "Product created successfully", data: product });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Something went wrong" });
  }
};


export async function update(req, res) {
  try {
    const id = parseInt(req.params.id);
    const product = await updateProduct(id, req.body);
    res.status(200).json({ success: true, message: "Product updated successfully", data: product });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Something went wrong" });
  }
};


export async function remove(req, res) {
  try {
    const id = parseInt(req.params.id);
    await deleteProduct(id);
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Something went wrong" });
  }
};