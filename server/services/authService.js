import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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


// Login 
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

function generateAccessToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Deliberately vague error — see explanation below
  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Persist the refresh token so it can be revoked/checked later
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    },
  });

  const { password: _password, ...safeUser } = user;

  return { user: safeUser, accessToken, refreshToken };
};


export async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    const error = new Error("Refresh token is required");
    error.statusCode = 401;
    throw error;
  }

  // Step 1: verify the JWT signature/expiry itself
  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    const error = new Error("Invalid or expired refresh token");
    error.statusCode = 401;
    throw error;
  }

  // Step 2: confirm this exact token still exists in the DB
  // (hasn't been revoked/logged-out, and matches our stored record)
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    const error = new Error("Refresh token not recognized or expired");
    error.statusCode = 401;
    throw error;
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });

  if (!user) {
    const error = new Error("User no longer exists");
    error.statusCode = 401;
    throw error;
  }

  const newAccessToken = generateAccessToken(user);

  return { accessToken: newAccessToken };
};


export async function logoutUser(refreshToken) {
  if (!refreshToken) {
    const error = new Error("Refresh token is required");
    error.statusCode = 400;
    throw error;
  }

  // deleteMany (not delete) because it won't throw if the token
  // doesn't exist — logging out an already-invalid token should
  // still succeed quietly, not error out.
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });

  return { message: "Logged out successfully" };
}