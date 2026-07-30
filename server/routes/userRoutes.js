import { Router } from "express";
import { getAll, getOne, update, remove } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { updateUserSchema } from "../validations/userValidation.js";

const router = Router();

// Every route here is ADMIN-only — this whole module is about
// managing staff accounts, not something Managers/Staff should touch.
router.get("/", protect, authorize("ADMIN"), getAll);
router.get("/:id", protect, authorize("ADMIN"), getOne);
router.put("/:id", protect, authorize("ADMIN"), validate(updateUserSchema), update);
router.delete("/:id", protect, authorize("ADMIN"), remove);

export default router;