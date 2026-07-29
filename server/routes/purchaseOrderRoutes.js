import { Router } from "express";
import { getAll, getOne, create, updateStatus } from "../controllers/purchaseOrderController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { createPurchaseOrderSchema, updatePOStatusSchema } from "../validations/purchaseOrderValidation.js";

const router = Router();

router.post("/", protect, authorize("ADMIN", "MANAGER"), validate(createPurchaseOrderSchema), create);
router.get("/", protect, getAll);
router.get("/:id", protect, getOne);
router.put("/:id/status", protect, authorize("ADMIN", "MANAGER"), validate(updatePOStatusSchema), updateStatus);

export default router;