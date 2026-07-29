import { Router } from "express";
import { getAll, create, update, remove } from "../controllers/productController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { createProductSchema, updateProductSchema } from "../validations/productValidation.js";

const router = Router();

router.get("/", protect, getAll);
router.post("/", protect, authorize("ADMIN", "MANAGER"), validate(createProductSchema), create);
router.put("/:id", protect, authorize("ADMIN", "MANAGER"), validate(updateProductSchema), update);
router.delete("/:id", protect, authorize("ADMIN", "MANAGER"), remove);

export default router;