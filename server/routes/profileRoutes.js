import { Router } from "express";
import { getMe, updateMe, updatePassword } from "../controllers/profileController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { updateProfileSchema, changePasswordSchema } from "../validations/profileValidation.js";

const router = Router();

// No authorize() here at all — any logged-in user, regardless of
// role, can view/edit their OWN profile. That's the whole point.
router.get("/", protect, getMe);
router.put("/", protect, validate(updateProfileSchema), updateMe);
router.put("/password", protect, validate(changePasswordSchema), updatePassword);

export default router;