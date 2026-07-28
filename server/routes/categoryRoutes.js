import { Router } from "express";
import { getAll, create, update, remove } from "../controllers/categoryController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { createCategorySchema, updateCategorySchema } from "../validations/categoryValidation.js";

const router = Router();

router.get("/", protect, getAll);
router.post("/", protect, authorize("ADMIN", "MANAGER"), validate(createCategorySchema), create);
router.put("/:id", protect, authorize("ADMIN", "MANAGER"), validate(updateCategorySchema), update);
router.delete("/:id", protect, authorize("ADMIN", "MANAGER"), remove);

export default router;