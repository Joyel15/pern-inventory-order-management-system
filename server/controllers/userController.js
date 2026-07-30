import { getUsers, getUserById, updateUser, deactivateUser } from "../services/userService.js";

export async function getAll(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const result = await getUsers({ page, limit, search });
    res.status(200).json({ success: true, message: "Users fetched successfully", data: result.users, pagination: result.pagination });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


export async function getOne(req, res) {
  try {
    const user = await getUserById(parseInt(req.params.id));
    res.status(200).json({ success: true, message: "User fetched successfully", data: user });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Something went wrong" });
  }
};


export async function update(req, res) {
  try {
    const id = parseInt(req.params.id);
    const user = await updateUser(id, req.body, req.user.userId);
    res.status(200).json({ success: true, message: "User updated successfully", data: user });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Something went wrong" });
  }
};


export async function remove(req, res) {
  try {
    const id = parseInt(req.params.id);
    const user = await deactivateUser(id, req.user.userId);
    res.status(200).json({ success: true, message: "User deactivated successfully", data: user });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Something went wrong" });
  }
};