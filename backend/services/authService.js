import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";

const SALT_ROUNDS = 10;

export async function registerUser({ name, email, password, role }) {
  // Hash the password BEFORE attempting the insert.
  // bcrypt.hash is async and CPU-intensive by design —
  // more "rounds" = slower to compute = harder to brute-force
  // if the hash is ever leaked.
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role, // if undefined, Prisma applies the @default(STAFF) from schema
      },
    });

    // Strip the password hash before returning —
    // this object may eventually be sent back in an HTTP response,
    // and the hash should never leave the server, even hashed.
    const { password: _password, ...safeUser } = user;
    return safeUser;

  } catch (error) {
    // P2002 = Prisma's code for "unique constraint violation"
    // This is what fires when Postgres rejects the insert
    // because "users_email_key" already has that email.
    if (error.code === "P2002") {
      const duplicateError = new Error("An account with this email already exists");
      duplicateError.statusCode = 409; // 409 Conflict — the standard status for "resource already exists"
      throw duplicateError;
    }

    // Any other error (DB connection issue, etc.) —
    // re-throw as-is; the controller will treat it as a generic 500.
    throw error;
  }
};