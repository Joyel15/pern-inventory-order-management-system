import { Router } from "express";
import { getAll, create, update, remove } from "../controllers/supplierController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { createSupplierSchema, updateSupplierSchema } from "../validations/supplierValidation.js";

const router = Router();

router.get("/", protect, getAll);
router.post("/", protect, authorize("ADMIN", "MANAGER"), validate(createSupplierSchema), create);
router.put("/:id", protect, authorize("ADMIN", "MANAGER"), validate(updateSupplierSchema), update);
router.delete("/:id", protect, authorize("ADMIN", "MANAGER"), remove);

export default router;