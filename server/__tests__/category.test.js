import request from "supertest";
import app from "../app.js";
import prisma from "../config/prisma.js";
import { resetDatabase } from "./helpers/resetDb.js";

let adminToken;
let staffToken;

beforeAll(async () => {
  await resetDatabase();

  // Create an ADMIN user directly via Prisma — bypassing the API
  // entirely, since we're not testing registration here, just
  // need a ready-made authenticated user as test setup.
  const bcrypt = await import("bcrypt");
  const hashedPassword = await bcrypt.hash("password123", 10);

  await prisma.user.create({
    data: { name: "Admin", email: "admin@test.com", password: hashedPassword, role: "ADMIN" },
  });
  await prisma.user.create({
    data: { name: "Staff", email: "staff@test.com", password: hashedPassword, role: "STAFF" },
  });

  // Log in as each, through the real API, to get real tokens
  const adminLogin = await request(app)
    .post("/auth/login")
    .send({ email: "admin@test.com", password: "password123" });
  adminToken = adminLogin.body.data.accessToken;

  const staffLogin = await request(app)
    .post("/auth/login")
    .send({ email: "staff@test.com", password: "password123" });
  staffToken = staffLogin.body.data.accessToken;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /categories", () => {
  it("should allow an ADMIN to create a category", async () => {
    const res = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Test Electronics", description: "For testing" });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Test Electronics");
  });

  it("should reject creation without a token", async () => {
    const res = await request(app)
      .post("/categories")
      .send({ name: "No Auth Category" });

    expect(res.status).toBe(401);
  });

  it("should reject creation from a STAFF user (RBAC check)", async () => {
    const res = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ name: "Staff Attempt" });

    expect(res.status).toBe(403);
  });

  it("should reject duplicate category names", async () => {
    const res = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Test Electronics" }); // same as first test

    expect(res.status).toBe(409);
  });
});

describe("GET /categories", () => {
  it("should return a paginated list for any authenticated user", async () => {
    const res = await request(app)
      .get("/categories")
      .set("Authorization", `Bearer ${staffToken}`); // STAFF can view, just not create

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toHaveProperty("total");
  });
});