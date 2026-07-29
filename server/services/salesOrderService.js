import prisma from "../config/prisma.js";

export async function createSalesOrder({ customerId, items }, userId) {
  return prisma.$transaction(async (tx) => {
    // Confirm the customer actually exists before doing any real work
    const customer = await tx.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      const error = new Error("Customer not found");
      error.statusCode = 404;
      throw error;
    }

    let totalAmount = 0;
    const itemsData = [];

    // Step through each requested item: verify stock, snapshot price
    for (const item of items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });

      if (!product) {
        const error = new Error(`Product with id ${item.productId} not found`);
        error.statusCode = 404;
        throw error;
      }

      if (product.quantity < item.quantity) {
        const error = new Error(
          `Insufficient stock for "${product.name}". Available: ${product.quantity}, requested: ${item.quantity}`
        );
        error.statusCode = 400;
        throw error;
      }

      const lineTotal = Number(product.price) * item.quantity;
      totalAmount += lineTotal;

      itemsData.push({
        productId: product.id,
        quantity: item.quantity,
        priceAtSale: product.price, // snapshot, not a live reference
      });

      // Reduce stock immediately, as we decided earlier
      await tx.product.update({
        where: { id: product.id },
        data: { quantity: { decrement: item.quantity } },
      });
    }

    // Now that every item passed validation and stock checks,
    // create the order header + line items together
    const order = await tx.salesOrder.create({
      data: {
        customerId,
        totalAmount,
        createdBy: userId,
        items: { create: itemsData },
      },
      include: {
        items: { include: { product: { select: { id: true, name: true, sku: true } } } },
        customer: { select: { id: true, name: true } },
      },
    });

    return order;
  });
};


const orderInclude = {
  customer: { select: { id: true, name: true, email: true } },
  items: {
    include: {
      product: { select: { id: true, name: true, sku: true } },
    },
  },
};

export async function getSalesOrders({ page = 1, limit = 10, status, customerId }) {
  const skip = (page - 1) * limit;

  const where = {
    ...(status && { status }),
    ...(customerId && { customerId: Number(customerId) }),
  };

  const [orders, total] = await Promise.all([
    prisma.salesOrder.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: orderInclude,
    }),
    prisma.salesOrder.count({ where }),
  ]);

  return {
    orders,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};


export async function getSalesOrderById(id) {
  const order = await prisma.salesOrder.findUnique({
    where: { id },
    include: orderInclude,
  });

  if (!order) {
    const error = new Error("Sales order not found");
    error.statusCode = 404;
    throw error;
  }

  return order;
};


export async function updateSalesOrderStatus(id, newStatus) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.salesOrder.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      const error = new Error("Sales order not found");
      error.statusCode = 404;
      throw error;
    }

    // Prevent nonsensical transitions — an order that's already
    // finished shouldn't be movable to a different state at all.
    if (order.status === "COMPLETED" || order.status === "CANCELLED") {
      const error = new Error(`Cannot change status of a ${order.status.toLowerCase()} order`);
      error.statusCode = 400;
      throw error;
    }

    // Cancelling restores stock — the mirror image of creation's decrement.
    if (newStatus === "CANCELLED") {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { increment: item.quantity } },
        });
      }
    }

    return tx.salesOrder.update({
      where: { id },
      data: { status: newStatus },
      include: orderInclude,
    });
  });
};