import { getProfile, updateProfile, changePassword } from "../services/profileService.js";

export async function getMe(req, res) {
  try {
    const user = await getProfile(req.user.userId);
    res.status(200).json({ success: true, message: "Profile fetched successfully", data: user });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Something went wrong" });
  }
};


export async function updateMe(req, res) {
  try {
    const user = await updateProfile(req.user.userId, req.body);
    res.status(200).json({ success: true, message: "Profile updated successfully", data: user });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Something went wrong" });
  }
};


export async function updatePassword(req, res) {
  try {
    const result = await changePassword(req.user.userId, req.body);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Something went wrong" });
  }
};