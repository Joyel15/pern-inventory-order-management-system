import prisma from "../config/prisma.js";

export async function createStockMovement({ productId, type, quantity, reason }, userId) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });

    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    // Only STOCK_OUT needs a sufficiency check — you can't remove
    // more than you have. STOCK_IN has no upper bound to worry about.
    if (type === "STOCK_OUT" && product.quantity < quantity) {
      const error = new Error(
        `Cannot remove ${quantity} units — only ${product.quantity} in stock`
      );
      error.statusCode = 400;
      throw error;
    }

    const quantityChange = type === "STOCK_IN" ? quantity : -quantity;

    await tx.product.update({
      where: { id: productId },
      data: { quantity: { increment: quantityChange } },
    });

    return tx.stockMovement.create({
      data: { productId, type, quantity, reason, createdBy: userId },
      include: { product: { select: { id: true, name: true, sku: true } } },
    });
  });
};


export async function getStockMovements({ page = 1, limit = 10, productId, type }) {
  const skip = (page - 1) * limit;
  const where = {
    ...(productId && { productId: Number(productId) }),
    ...(type && { type }),
  };

  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { product: { select: { id: true, name: true, sku: true } } },
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return { movements, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};