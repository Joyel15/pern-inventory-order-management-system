import request from "supertest";
import app from "../app.js";
import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import { resetDatabase } from "./helpers/resetDb.js";

let adminToken;
let testProduct;
let testCustomer;

beforeAll(async () => {
  await resetDatabase();

  const hashedPassword = await bcrypt.hash("password123", 10);
  await prisma.user.create({
    data: { name: "Admin", email: "admin@test.com", password: hashedPassword, role: "ADMIN" },
  });

  const login = await request(app)
    .post("/auth/login")
    .send({ email: "admin@test.com", password: "password123" });
  adminToken = login.body.data.accessToken;

  // Set up a product with known stock, and a customer to order against
  const category = await prisma.category.create({ data: { name: "Test Category" } });
  testProduct = await prisma.product.create({
    data: { name: "Test Widget", sku: "TEST-001", price: 10.0, quantity: 20, categoryId: category.id },
  });
  testCustomer = await prisma.customer.create({ data: { name: "Test Customer" } });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /sales-orders", () => {
  it("should create an order and decrement stock correctly", async () => {
    const res = await request(app)
      .post("/sales-orders")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ customerId: testCustomer.id, items: [{ productId: testProduct.id, quantity: 5 }] });

    expect(res.status).toBe(201);
    expect(res.body.data.totalAmount).toBe("50.00"); // 5 x 10.00

    // Verify stock actually decreased in the database —
    // not just trusting the API response, checking the real row
    const updatedProduct = await prisma.product.findUnique({ where: { id: testProduct.id } });
    expect(updatedProduct.quantity).toBe(15); // 20 - 5
  });

  it("should reject and roll back an order with insufficient stock", async () => {
    const beforeProduct = await prisma.product.findUnique({ where: { id: testProduct.id } });

    const res = await request(app)
      .post("/sales-orders")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ customerId: testCustomer.id, items: [{ productId: testProduct.id, quantity: 9999 }] });

    expect(res.status).toBe(400);

    // The real proof of rollback: stock must be UNCHANGED
    // after the failed attempt, not partially decremented
    const afterProduct = await prisma.product.findUnique({ where: { id: testProduct.id } });
    expect(afterProduct.quantity).toBe(beforeProduct.quantity);
  });

  it("should reject an order for a non-existent product", async () => {
    const res = await request(app)
      .post("/sales-orders")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ customerId: testCustomer.id, items: [{ productId: 999999, quantity: 1 }] });

    expect(res.status).toBe(404);
  });
});

describe("PUT /sales-orders/:id/status", () => {
  it("should restore stock when an order is cancelled", async () => {
    // Place a fresh order specifically for this test
    const orderRes = await request(app)
      .post("/sales-orders")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ customerId: testCustomer.id, items: [{ productId: testProduct.id, quantity: 3 }] });

    const orderId = orderRes.body.data.id;
    const stockAfterOrder = await prisma.product.findUnique({ where: { id: testProduct.id } });

    const cancelRes = await request(app)
      .put(`/sales-orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "CANCELLED" });

    expect(cancelRes.status).toBe(200);

    const stockAfterCancel = await prisma.product.findUnique({ where: { id: testProduct.id } });
    expect(stockAfterCancel.quantity).toBe(stockAfterOrder.quantity + 3);
  });

  it("should reject changing status of an already-cancelled order", async () => {
    // Reuse the same cancelled order pattern — create, cancel, try again
    const orderRes = await request(app)
      .post("/sales-orders")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ customerId: testCustomer.id, items: [{ productId: testProduct.id, quantity: 1 }] });

    const orderId = orderRes.body.data.id;

    await request(app)
      .put(`/sales-orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "CANCELLED" });

    const secondAttempt = await request(app)
      .put(`/sales-orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "COMPLETED" });

    expect(secondAttempt.status).toBe(400);
  });
});