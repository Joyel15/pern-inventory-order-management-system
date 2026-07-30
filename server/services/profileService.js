import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";

const profileSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: profileSelect });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
}

export async function updateProfile(userId, data) {
  try {
    return await prisma.user.update({ where: { id: userId }, data, select: profileSelect });
  } catch (error) {
    if (error.code === "P2002") {
      const err = new Error("This email is already in use");
      err.statusCode = 409;
      throw err;
    }
    throw error;
  }
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(currentPassword, user.password);
  if (!passwordMatches) {
    const error = new Error("Current password is incorrect");
    error.statusCode = 401;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });

  // Revoke all existing refresh tokens for this user —
  // explained below
  await prisma.refreshToken.deleteMany({ where: { userId } });

  return { message: "Password changed successfully. Please log in again." };
}