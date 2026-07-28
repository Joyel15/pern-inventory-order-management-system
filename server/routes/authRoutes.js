import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { register , login , refresh , logout } from "../controllers/authController.js";
import { registerSchema , loginSchema} from "../validations/authValidation.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/register", validate(registerSchema) ,register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.get("/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "You are authenticated",
    data: req.user,
  });
});

export default router;