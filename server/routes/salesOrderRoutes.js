import { Router } from "express";
import { getAll, getOne, create, updateStatus } from "../controllers/salesOrderController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { createSalesOrderSchema , updateStatusSchema } from "../validations/salesOrderValidation.js";

const router = Router();

router.post("/", protect, authorize("ADMIN", "MANAGER", "STAFF"), validate(createSalesOrderSchema), create);
router.get("/", protect, getAll);
router.get("/:id", protect, getOne);
router.put("/:id/status", protect, authorize("ADMIN", "MANAGER"), validate(updateStatusSchema), updateStatus);

export default router;