import prisma from "../config/prisma.js";

export async function getCustomers({ page = 1, limit = 10, search = "" }) {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.customer.count({ where }),
  ]);

  return {
    customers,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};


export async function createCustomer(data, userId) {
  try {
    return await prisma.customer.create({ data: { ...data, createdBy: userId } });
  } catch (error) {
    if (error.code === "P2002") {
      const err = new Error("A customer with this email already exists");
      err.statusCode = 409;
      throw err;
    }
    throw error;
  }
};


export async function updateCustomer(id, data) {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) {
    const err = new Error("Customer not found");
    err.statusCode = 404;
    throw err;
  }

  try {
    return await prisma.customer.update({ where: { id }, data });
  } catch (error) {
    if (error.code === "P2002") {
      const err = new Error("A customer with this email already exists");
      err.statusCode = 409;
      throw err;
    }
    throw error;
  }
};


export async function deleteCustomer(id) {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) {
    const err = new Error("Customer not found");
    err.statusCode = 404;
    throw err;
  }
  return prisma.customer.delete({ where: { id } });
};