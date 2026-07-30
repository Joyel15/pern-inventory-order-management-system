import { 
  getMonthlyRevenue , 
  getInventoryValuation ,
  getProductPerformance 
} from "../services/reportService.js";

export async function monthlyRevenue(req, res) {
  try {
    const data = await getMonthlyRevenue();
    res.status(200).json({ success: true, message: "Monthly revenue report generated successfully", data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


export async function inventoryValuation(req, res) {
  try {
    const data = await getInventoryValuation();
    res.status(200).json({ success: true, message: "Inventory valuation report generated successfully", data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


export async function productPerformance(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await getProductPerformance(limit);
    res.status(200).json({ success: true, message: "Product performance report generated successfully", data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};