import { Router } from "express";
import { create } from "../controllers/salesOrderController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { createSalesOrderSchema } from "../validations/salesOrderValidation.js";

const router = Router();

router.post("/", protect, authorize("ADMIN", "MANAGER", "STAFF"), validate(createSalesOrderSchema), create);

export default router;