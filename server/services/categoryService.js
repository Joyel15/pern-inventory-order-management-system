import prisma from "../config/prisma.js";

export async function getCategories({ page = 1, limit = 10, search = "" }) {
  const skip = (page - 1) * limit;

  // "where" clause is built conditionally — if there's no search term,
  // we don't want to filter at all, just return everything.
  const where = search
    ? { name: { contains: search, mode: "insensitive" } }
    : {};

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.count({ where }),
  ]);

  return {
    categories,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function createCategory(data, userId) {
  return prisma.category.create({
    data: {
      ...data,
      createdBy: userId,
    },
  });
}

export async function updateCategory(id, data) {
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id) {
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  return prisma.category.delete({ where: { id } });
}