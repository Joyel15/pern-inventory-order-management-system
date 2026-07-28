import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService.js";

export async function getAll(req, res) {
  try {
    // Query params arrive as strings — must convert page/limit to numbers
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const result = await getCategories({ page, limit, search });

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: result.categories,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export async function create(req, res) {
  try {
    const category = await createCategory(req.body, req.user.userId);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    const statusCode = error.code === "P2002" ? 409 : error.statusCode || 500;
    const message =
      error.code === "P2002" ? "A category with this name already exists" : error.message;

    res.status(statusCode).json({ success: false, message: message || "Something went wrong" });
  }
};

export async function update(req, res) {
  try {
    const id = parseInt(req.params.id);
    const category = await updateCategory(id, req.body);

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export async function remove(req, res) {
  try {
    const id = parseInt(req.params.id);
    await deleteCategory(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};