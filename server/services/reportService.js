import prisma from "../config/prisma.js";

export async function getMonthlyRevenue() {
  const result = await prisma.$queryRaw`
    SELECT
      DATE_TRUNC('month', "createdAt") AS month,
      SUM("totalAmount") AS revenue,
      COUNT(*) AS order_count
    FROM sales_orders
    WHERE status = 'COMPLETED'
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12
  `;

  // BigInt/Decimal values from raw queries don't serialize to
  // JSON cleanly by default — convert them to plain numbers here.
  return result.map((row) => ({
    month: row.month,
    revenue: Number(row.revenue),
    orderCount: Number(row.order_count),
  }));
};


export async function getInventoryValuation() {
  const result = await prisma.$queryRaw`
    SELECT
      c.name AS category_name,
      SUM(p.quantity * p.price) AS total_value,
      SUM(p.quantity) AS total_units
    FROM products p
    LEFT JOIN categories c ON p."categoryId" = c.id
    GROUP BY c.name
    ORDER BY total_value DESC
  `;

  return result.map((row) => ({
    categoryName: row.category_name || "Uncategorized",
    totalValue: Number(row.total_value),
    totalUnits: Number(row.total_units),
  }));
};


export async function getProductPerformance(limit = 10) {
  const result = await prisma.$queryRaw`
    SELECT
      p.id,
      p.name,
      p.sku,
      SUM(soi.quantity) AS total_units_sold,
      SUM(soi.quantity * soi."priceAtSale") AS total_revenue
    FROM sales_order_items soi
    JOIN products p ON soi."productId" = p.id
    JOIN sales_orders so ON soi."salesOrderId" = so.id
    WHERE so.status = 'COMPLETED'
    GROUP BY p.id, p.name, p.sku
    ORDER BY total_revenue DESC
    LIMIT ${limit}
  `;

  return result.map((row) => ({
    productId: row.id,
    name: row.name,
    sku: row.sku,
    totalUnitsSold: Number(row.total_units_sold),
    totalRevenue: Number(row.total_revenue),
  }));
}