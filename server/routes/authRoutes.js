import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { register } from "../controllers/authController.js";
import { registerSchema } from "../validations/authValidation.js";

const router = Router();

router.post("/register", validate(registerSchema) ,register);

export default router;