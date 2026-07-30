import { Router } from "express";
import { monthlyRevenue } from "../controllers/reportController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.get("/monthly-revenue", protect, authorize("ADMIN", "MANAGER"), monthlyRevenue);

export default router;