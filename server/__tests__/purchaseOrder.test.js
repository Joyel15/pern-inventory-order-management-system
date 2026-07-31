import request from "supertest";
import app from "../app.js";
import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import { resetDatabase } from "./helpers/resetDb.js";

let adminToken;
let staffToken;
let testProduct;
let testSupplier;

beforeAll(async () => {
  await resetDatabase();

  const hashedPassword = await bcrypt.hash("password123", 10);
  await prisma.user.create({
    data: { name: "Admin", email: "admin@test.com", password: hashedPassword, role: "ADMIN" },
  });
  await prisma.user.create({
    data: { name: "Staff", email: "staff@test.com", password: hashedPassword, role: "STAFF" },
  });

  const adminLogin = await request(app)
    .post("/auth/login")
    .send({ email: "admin@test.com", password: "password123" });
  adminToken = adminLogin.body.data.accessToken;

  const staffLogin = await request(app)
    .post("/auth/login")
    .send({ email: "staff@test.com", password: "password123" });
  staffToken = staffLogin.body.data.accessToken;

  const category = await prisma.category.create({ data: { name: "Test Category" } });
  testProduct = await prisma.product.create({
    data: { name: "Test Widget", sku: "PO-TEST-001", price: 10.0, quantity: 20, categoryId: category.id },
  });
  testSupplier = await prisma.supplier.create({ data: { name: "Test Supplier" } });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /purchase-orders", () => {
  it("should create a purchase order and INCREMENT stock", async () => {
    const res = await request(app)
      .post("/purchase-orders")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        supplierId: testSupplier.id,
        items: [{ productId: testProduct.id, quantity: 15, cost: 6.5 }],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.totalAmount).toBe("97.50"); // 15 x 6.50

    const updated = await prisma.product.findUnique({ where: { id: testProduct.id } });
    expect(updated.quantity).toBe(35); // 20 + 15 — incremented, not decremented
  });

  it("should reject creation from a STAFF user (RBAC — different from Sales Orders)", async () => {
    const res = await request(app)
      .post("/purchase-orders")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ supplierId: testSupplier.id, items: [{ productId: testProduct.id, quantity: 5, cost: 5 }] });

    expect(res.status).toBe(403);
  });

  it("should reject a purchase order for a non-existent supplier", async () => {
    const res = await request(app)
      .post("/purchase-orders")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ supplierId: 999999, items: [{ productId: testProduct.id, quantity: 5, cost: 5 }] });

    expect(res.status).toBe(404);
  });
});

describe("PUT /purchase-orders/:id/status", () => {
  it("should DECREMENT stock when a purchase order is cancelled", async () => {
    const orderRes = await request(app)
      .post("/purchase-orders")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ supplierId: testSupplier.id, items: [{ productId: testProduct.id, quantity: 10, cost: 5 }] });

    const orderId = orderRes.body.data.id;
    const stockAfterOrder = await prisma.product.findUnique({ where: { id: testProduct.id } });

    const cancelRes = await request(app)
      .put(`/purchase-orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "CANCELLED" });

    expect(cancelRes.status).toBe(200);

    const stockAfterCancel = await prisma.product.findUnique({ where: { id: testProduct.id } });
    expect(stockAfterCancel.quantity).toBe(stockAfterOrder.quantity - 10); // mirror of Sales Orders' +3
  });

  it("should reject changing status of an already-cancelled purchase order", async () => {
    const orderRes = await request(app)
      .post("/purchase-orders")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ supplierId: testSupplier.id, items: [{ productId: testProduct.id, quantity: 1, cost: 5 }] });

    const orderId = orderRes.body.data.id;

    await request(app)
      .put(`/purchase-orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "CANCELLED" });

    const secondAttempt = await request(app)
      .put(`/purchase-orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "COMPLETED" });

    expect(secondAttempt.status).toBe(400);
  });
});