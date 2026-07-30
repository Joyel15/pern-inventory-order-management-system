import {
  getSummary,
  getLowStockCount,
  getTotalRevenue,
  getRecentOrders,
  getLowStockProducts,
  getTopSellingProducts,
} from "../services/dashboardService.js";

export async function getDashboard(req, res) {
  try {
    const [summary, lowStockCount, totalRevenue, recentOrders, lowStockProducts, topSellingProducts] =
      await Promise.all([
        getSummary(),
        getLowStockCount(),
        getTotalRevenue(),
        getRecentOrders(),
        getLowStockProducts(),
        getTopSellingProducts(),
      ]);

    res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: {
        summary: { ...summary, lowStockCount, totalRevenue },
        recentOrders,
        lowStockProducts,
        topSellingProducts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};