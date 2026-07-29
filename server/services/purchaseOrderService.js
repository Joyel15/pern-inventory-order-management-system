import prisma from "../config/prisma.js";

const poInclude = {
  supplier: { select: { id: true, name: true } },
  items: { include: { product: { select: { id: true, name: true, sku: true } } } },
};

export async function createPurchaseOrder({ supplierId, items }, userId) {
  return prisma.$transaction(async (tx) => {
    const supplier = await tx.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) {
      const error = new Error("Supplier not found");
      error.statusCode = 404;
      throw error;
    }

    let totalAmount = 0;
    const itemsData = [];

    for (const item of items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        const error = new Error(`Product with id ${item.productId} not found`);
        error.statusCode = 404;
        throw error;
      }

      totalAmount += item.cost * item.quantity;

      itemsData.push({
        productId: product.id,
        quantity: item.quantity,
        costAtPurchase: item.cost,
      });

      // Receiving stock — increment, not decrement. No stock check needed.
      await tx.product.update({
        where: { id: product.id },
        data: { quantity: { increment: item.quantity } },
      });
    }

    return tx.purchaseOrder.create({
      data: {
        supplierId,
        totalAmount,
        createdBy: userId,
        items: { create: itemsData },
      },
      include: poInclude,
    });
  });
}

export async function getPurchaseOrders({ page = 1, limit = 10, status, supplierId }) {
  const skip = (page - 1) * limit;
  const where = {
    ...(status && { status }),
    ...(supplierId && { supplierId: Number(supplierId) }),
  };

  const [orders, total] = await Promise.all([
    prisma.purchaseOrder.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, include: poInclude }),
    prisma.purchaseOrder.count({ where }),
  ]);

  return { orders, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export async function getPurchaseOrderById(id) {
  const order = await prisma.purchaseOrder.findUnique({ where: { id }, include: poInclude });
  if (!order) {
    const error = new Error("Purchase order not found");
    error.statusCode = 404;
    throw error;
  }
  return order;
}

export async function updatePurchaseOrderStatus(id, newStatus) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.purchaseOrder.findUnique({ where: { id }, include: { items: true } });

    if (!order) {
      const error = new Error("Purchase order not found");
      error.statusCode = 404;
      throw error;
    }

    if (order.status === "COMPLETED" || order.status === "CANCELLED") {
      const error = new Error(`Cannot change status of a ${order.status.toLowerCase()} order`);
      error.statusCode = 400;
      throw error;
    }

    // Cancelling a purchase order removes the stock it added
    if (newStatus === "CANCELLED") {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      }
    }

    return tx.purchaseOrder.update({ where: { id }, data: { status: newStatus }, include: poInclude });
  });
}