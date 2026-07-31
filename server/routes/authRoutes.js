import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { register , login , refresh , logout } from "../controllers/authController.js";
import { registerSchema , loginSchema} from "../validations/authValidation.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/register", authLimiter , validate(registerSchema) ,register);
router.post("/login", authLimiter ,validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;