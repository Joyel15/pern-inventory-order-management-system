import prisma from "../../config/prisma.js";

// Deletes every table's data, in an order that respects every
// foreign key constraint in the schema — children before parents,
// always. Any test file can call this and trust the database
// starts completely empty, regardless of what other test files
// left behind.
export async function resetDatabase() {
  await prisma.stockMovement.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.salesOrderItem.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
};