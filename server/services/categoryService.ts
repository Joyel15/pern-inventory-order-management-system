import type { Prisma } from "@prisma/client";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import type { ListParams } from "../types/pagination.js";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../validations/categoryValidation.js";

export async function getCategories({ page = 1, limit = 10, search = "" }: ListParams) {
  const skip = (page - 1) * limit;

  // "where" clause is built conditionally — if there's no search term,
  // we don't want to filter at all, just return everything.
  const where: Prisma.CategoryWhereInput = search
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

export async function createCategory(data: CreateCategoryInput, userId: number) {
  return prisma.category.create({
    data: {
      ...data,
      createdBy: userId,
    },
  });
}

export async function updateCategory(id: number, data: UpdateCategoryInput) {
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: number) {
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return prisma.category.delete({ where: { id } });
}
