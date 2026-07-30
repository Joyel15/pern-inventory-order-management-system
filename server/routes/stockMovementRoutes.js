import { Router } from "express";
import { getAll, create } from "../controllers/stockMovementController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { createStockMovementSchema } from "../validations/stockMovementValidation.js";

const router = Router();

router.post("/", protect, authorize("ADMIN", "MANAGER", "STAFF"), validate(createStockMovementSchema), create);
router.get("/", protect, getAll);

export default router;