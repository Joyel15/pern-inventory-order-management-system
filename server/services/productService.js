import prisma from "../config/prisma.js";

// Shared "include" shape — reused across getAll/getOne so the
// nested category/supplier data always looks the same everywhere.
const productInclude = {
  category: { select: { id: true, name: true } },
  supplier: { select: { id: true, name: true } },
};

export async function getProducts({ page = 1, limit = 10, search = "", categoryId, supplierId }) {
  const skip = (page - 1) * limit;

  // Build the where clause conditionally, piece by piece —
  // only include filters that were actually provided.
  const where = {
    ...(search && { name: { contains: search, mode: "insensitive" } }),
    ...(categoryId && { categoryId: Number(categoryId) }),
    ...(supplierId && { supplierId: Number(supplierId) }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: productInclude,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};


export async function createProduct(data, userId) {
  try {
    return await prisma.product.create({
      data: { ...data, createdBy: userId },
      include: productInclude,
    });
  } catch (error) {
    if (error.code === "P2002") {
      const err = new Error("A product with this SKU already exists");
      err.statusCode = 409;
      throw err;
    }
    throw error;
  }
};


export async function updateProduct(id, data) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }

  try {
    return await prisma.product.update({ where: { id }, data, include: productInclude });
  } catch (error) {
    if (error.code === "P2002") {
      const err = new Error("A product with this SKU already exists");
      err.statusCode = 409;
      throw err;
    }
    throw error;
  }
};


export async function deleteProduct(id) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }
  return prisma.product.delete({ where: { id } });
};