import request from "supertest";
import app from "../app.js";
import prisma from "../config/prisma.js";
import { resetDatabase } from "./helpers/resetDb.js";

// Runs once before any test in this file — start from a clean slate
beforeAll(async () => {
  await resetDatabase();
});

// Runs once after all tests in this file finish — close the DB connection
// so Jest doesn't hang waiting for an open connection pool
afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /auth/register", () => {
  it("should register a new user successfully", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "Test User",
      email: "jesttest@example.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.email).toBe("jesttest@example.com");
    expect(res.body.data).not.toHaveProperty("password");
  });

  it("should reject registration with an invalid email", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "Test User",
      email: "notanemail",
      password: "password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject duplicate email registration", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "Duplicate User",
      email: "jesttest@example.com", // same as the first test
      password: "password123",
    });

    expect(res.status).toBe(409);
  });
});

describe("POST /auth/login", () => {
  it("should log in successfully with correct credentials", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "jesttest@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("accessToken");
    expect(res.body.data).toHaveProperty("refreshToken");
  });

  it("should reject login with wrong password", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "jesttest@example.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
  });
});