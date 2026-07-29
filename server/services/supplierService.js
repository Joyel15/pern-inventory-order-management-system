import prisma from "../config/prisma.js";

export async function getSuppliers({ page = 1, limit = 10, search = "" }) {
  const skip = (page - 1) * limit;

  const where = search
    ? { name: { contains: search, mode: "insensitive" } }
    : {};

  const [suppliers, total] = await Promise.all([
    prisma.supplier.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.supplier.count({ where }),
  ]);

  return {
    suppliers,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function createSupplier(data, userId) {
  try {
    return await prisma.supplier.create({ data: { ...data, createdBy: userId } });
  } catch (error) {
    if (error.code === "P2002") {
      const err = new Error("A supplier with this name already exists");
      err.statusCode = 409;
      throw err;
    }
    throw error;
  }
}

export async function updateSupplier(id, data) {
  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier) {
    const err = new Error("Supplier not found");
    err.statusCode = 404;
    throw err;
  }
  return prisma.supplier.update({ where: { id }, data });
}

export async function deleteSupplier(id) {
  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier) {
    const err = new Error("Supplier not found");
    err.statusCode = 404;
    throw err;
  }
  return prisma.supplier.delete({ where: { id } });
}