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