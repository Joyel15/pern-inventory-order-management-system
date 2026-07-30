import prisma from "../config/prisma.js";

const LOW_STOCK_THRESHOLD = 10;

export async function getSummary() {
  const [totalProducts, totalCategories, totalCustomers, totalSuppliers] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.customer.count(),
    prisma.supplier.count(),
  ]);

  return { totalProducts, totalCategories, totalCustomers, totalSuppliers };
};


export async function getLowStockCount(threshold = LOW_STOCK_THRESHOLD) {
  return prisma.product.count({
    where: { quantity: { lte: threshold } },
  });
};


export async function getTotalRevenue() {
  const result = await prisma.salesOrder.aggregate({
    where: { status: "COMPLETED" },
    _sum: { totalAmount: true },
  });

  return result._sum.totalAmount || 0;
};


export async function getRecentOrders(limit = 5) {
  return prisma.salesOrder.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { id: true, name: true } },
    },
  });
};


export async function getLowStockProducts(threshold = LOW_STOCK_THRESHOLD) {
  return prisma.product.findMany({
    where: { quantity: { lte: threshold } },
    orderBy: { quantity: "asc" },
    select: { id: true, name: true, sku: true, quantity: true },
  });
};


export async function getTopSellingProducts(limit = 5) {
  const grouped = await prisma.salesOrderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  const productIds = grouped.map((g) => g.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, sku: true },
  });

  return grouped.map((g) => ({
    product: products.find((p) => p.id === g.productId),
    totalQuantitySold: g._sum.quantity,
  }));
};