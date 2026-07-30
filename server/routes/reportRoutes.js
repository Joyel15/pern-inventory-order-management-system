import { Router } from "express";
import { monthlyRevenue , inventoryValuation , productPerformance } from "../controllers/reportController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.get("/monthly-revenue", protect, authorize("ADMIN", "MANAGER"), monthlyRevenue);
router.get("/inventory-valuation", protect, authorize("ADMIN", "MANAGER"), inventoryValuation);
router.get("/product-performance", protect, authorize("ADMIN", "MANAGER"), productPerformance);

export default router;