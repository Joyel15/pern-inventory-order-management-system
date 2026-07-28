import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { register , login , refresh , logout } from "../controllers/authController.js";
import { registerSchema , loginSchema} from "../validations/authValidation.js";

const router = Router();

router.post("/register", validate(registerSchema) ,register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;