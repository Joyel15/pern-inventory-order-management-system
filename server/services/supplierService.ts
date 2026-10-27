import type { Prisma } from "@prisma/client";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { hasPrismaCode } from "../utils/prismaErrors.js";
import type { ListParams } from "../types/pagination.js";
import type {
  CreateSupplierInput,
  UpdateSupplierInput,
} from "../validations/supplierValidation.js";

export async function getSuppliers({ page = 1, limit = 10, search = "" }: ListParams) {
  const skip = (page - 1) * limit;

  const where: Prisma.SupplierWhereInput = search
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

export async function createSupplier(data: CreateSupplierInput, userId: number) {
  try {
    return await prisma.supplier.create({ data: { ...data, createdBy: userId } });
  } catch (error) {
    if (hasPrismaCode(error, "P2002")) {
      throw new AppError("A supplier with this name already exists", 409);
    }
    throw error;
  }
}

export async function updateSupplier(id: number, data: UpdateSupplierInput) {
  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier) {
    throw new AppError("Supplier not found", 404);
  }
  return prisma.supplier.update({ where: { id }, data });
}

export async function deleteSupplier(id: number) {
  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier) {
    throw new AppError("Supplier not found", 404);
  }
  return prisma.supplier.delete({ where: { id } });
}
