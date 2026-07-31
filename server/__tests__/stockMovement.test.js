import request from "supertest";
import app from "../app.js";
import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";

let adminToken;
let testProduct;

beforeAll(async () => {
  await prisma.stockMovement.deleteMany();
  await prisma.salesOrderItem.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);
  await prisma.user.create({
    data: { name: "Admin", email: "admin@test.com", password: hashedPassword, role: "ADMIN" },
  });

  const login = await request(app)
    .post("/auth/login")
    .send({ email: "admin@test.com", password: "password123" });
  adminToken = login.body.data.accessToken;

  const category = await prisma.category.create({ data: { name: "Test Category" } });
  testProduct = await prisma.product.create({
    data: { name: "Test Widget", sku: "STOCK-001", price: 5.0, quantity: 50, categoryId: category.id },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /stock-movements", () => {
  it("should increase stock on STOCK_IN", async () => {
    const res = await request(app)
      .post("/stock-movements")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ productId: testProduct.id, type: "STOCK_IN", quantity: 10, reason: "Test restock" });

    expect(res.status).toBe(201);

    const updated = await prisma.product.findUnique({ where: { id: testProduct.id } });
    expect(updated.quantity).toBe(60); // 50 + 10
  });

  it("should decrease stock on STOCK_OUT", async () => {
    const res = await request(app)
      .post("/stock-movements")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ productId: testProduct.id, type: "STOCK_OUT", quantity: 15, reason: "Test damage" });

    expect(res.status).toBe(201);

    const updated = await prisma.product.findUnique({ where: { id: testProduct.id } });
    expect(updated.quantity).toBe(45); // 60 - 15
  });

  it("should reject STOCK_OUT exceeding available quantity", async () => {
    const before = await prisma.product.findUnique({ where: { id: testProduct.id } });

    const res = await request(app)
      .post("/stock-movements")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ productId: testProduct.id, type: "STOCK_OUT", quantity: 99999 });

    expect(res.status).toBe(400);

    const after = await prisma.product.findUnique({ where: { id: testProduct.id } });
    expect(after.quantity).toBe(before.quantity); // unchanged — rollback proof
  });

  it("should reject a negative or zero quantity", async () => {
    const res = await request(app)
      .post("/stock-movements")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ productId: testProduct.id, type: "STOCK_IN", quantity: -5 });

    expect(res.status).toBe(400);
  });
});