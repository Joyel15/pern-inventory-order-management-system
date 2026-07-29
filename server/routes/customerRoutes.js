import { Router } from "express";
import { getAll, create, update, remove } from "../controllers/customerController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { createCustomerSchema, updateCustomerSchema } from "../validations/customerValidation.js";

const router = Router();

router.get("/", protect, getAll);
router.post("/", protect, authorize("ADMIN", "MANAGER"), validate(createCustomerSchema), create);
router.put("/:id", protect, authorize("ADMIN", "MANAGER"), validate(updateCustomerSchema), update);
router.delete("/:id", protect, authorize("ADMIN", "MANAGER"), remove);

export default router;