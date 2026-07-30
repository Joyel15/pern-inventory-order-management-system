import prisma from "../config/prisma.js";

// Reused everywhere we return a user — ensures password is NEVER
// accidentally included, without relying on manual destructuring
// scattered across multiple functions.
const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

export async function getUsers({ page = 1, limit = 10, search = "" }) {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, select: userSelect }),
    prisma.user.count({ where }),
  ]);

  return { users, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};


export async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};


export async function updateUser(id, data, requestingUserId) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // Self-protection: an admin can't demote or deactivate themselves
  const isSelf = id === requestingUserId;
  if (isSelf && data.role && data.role !== "ADMIN") {
    const error = new Error("You cannot change your own role away from Admin");
    error.statusCode = 400;
    throw error;
  }
  if (isSelf && data.isActive === false) {
    const error = new Error("You cannot deactivate your own account");
    error.statusCode = 400;
    throw error;
  }

  return prisma.user.update({ where: { id }, data, select: userSelect });
};


export async function deactivateUser(id, requestingUserId) {
  if (id === requestingUserId) {
    const error = new Error("You cannot deactivate your own account");
    error.statusCode = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return prisma.user.update({ where: { id }, data: { isActive: false }, select: userSelect });
};