# Inventory & Order Management System

A production-style, full-stack inventory and order management platform built with the PERN stack. Supports role-based access control, real-time stock tracking, atomic order processing, and financial/inventory reporting.

**Live Demo:** https://stockflow-inventory-order-management.vercel.app(#) &nbsp;|&nbsp; **API:** https://pern-inventory-order-management-system.onrender.com(#)

---

## Overview

This system lets a business manage products, categories, suppliers, and customers, process sales and purchase orders with automatic stock adjustment, track manual stock movements, and generate reports — all behind secure, role-based authentication.

It was built incrementally, one feature at a time: plan → database design → backend → tests → frontend, with particular emphasis on correct relational database design and safe, atomic transaction handling.

---

## Tech Stack

**Frontend**
- React (Vite)
- React Router
- Tailwind CSS v4
- Axios
- React Hook Form

**Backend**
- Node.js / Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication (access + refresh tokens)
- bcrypt

**Testing & Tooling**
- Jest + Supertest (backend integration tests)
- express-rate-limit

**Deployment**
- Frontend: Vercel
- Backend: Render
- Database: Aiven (PostgreSQL)

---

## Features

### Authentication & Authorization
- JWT access/refresh token flow with database-backed refresh token revocation
- Role-based access control (`ADMIN`, `MANAGER`, `STAFF`) enforced on both API and UI
- Secure password hashing with bcrypt
- Password change automatically revokes all active sessions
- Rate limiting on login/register endpoints

### Core Modules
- **Products** — CRUD with category/supplier relations, search, filtering, pagination
- **Categories & Suppliers** — CRUD with audit trail (`createdBy`)
- **Customers** — CRUD with nullable-unique email handling
- **Sales Orders** — Multi-item orders with atomic stock deduction, insufficient-stock protection, and guarded status transitions (`PENDING → PROCESSING → COMPLETED` / `CANCELLED`, with automatic stock restoration on cancellation)
- **Purchase Orders** — Mirrors Sales Orders with stock increment instead of decrement
- **Stock Movements** — Manual stock adjustments (in/out) with audit reasons, fully atomic
- **User Management** — Admin-only role editing and soft-delete (deactivate/reactivate) with self-protection guards
- **Profile** — Self-service account info and password change
- **Dashboard** — Aggregate queries: summary counts, revenue, recent orders, low-stock alerts, top-selling products
- **Reports** — Hand-written raw SQL reports (monthly revenue trend, inventory valuation, product performance) using `JOIN`, `GROUP BY`, and `DATE_TRUNC`

---

## Database Design

13 relational tables designed with deliberate foreign key strategies:

| Relationship | Strategy | Reasoning |
|---|---|---|
| `RefreshToken → User` | `CASCADE` | A token is meaningless without its user |
| `Category/Supplier/Product → User (createdBy)` | `SET NULL` | Preserve records even if the creator's account is removed |
| `SalesOrderItem → SalesOrder` | `CASCADE` | Line items can't exist without their parent order |
| `SalesOrder/PurchaseOrder → Customer/Supplier` | `RESTRICT` | Never allow deletion of a party with financial history |

Every order line item snapshots price (`priceAtSale` / `costAtPurchase`) at time of transaction, so historical records remain accurate even if a product's price changes later.

---

## Architecture Highlights

- **Atomic transactions** (`prisma.$transaction`) guarantee stock and order data stay consistent — verified with tests asserting rollback leaves the database completely unchanged on failure, not just checking HTTP status codes.
- **Layered backend structure**: routes → controllers → services → Prisma, keeping HTTP handling separate from business logic.
- **Consistent API contract**: every response follows `{ success, message, data }` / `{ success, message }` for errors.
- **Centralized error handling**: global 404 and error-handling middleware, no unhandled exceptions leak raw stack traces to clients.

---

## Testing

24 automated tests across 5 suites (Jest + Supertest), run against an isolated test database:

- Auth: registration, login, validation, duplicate detection
- RBAC boundary enforcement across roles
- Transaction rollback verified at the database level (not just response codes)
- Stock increment/decrement math for both order types and manual movements

```bash
cd backend
npm test
```

---

## Project Structure

```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── validations/
│   ├── __tests__/
│   ├── app.js
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        ├── context/
        ├── hooks/
        ├── layouts/
        ├── pages/
        ├── services/
        └── App.jsx
```

---

## Local Setup

### Prerequisites
- Node.js
- PostgreSQL

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT secrets
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

**backend/.env**
```
DATABASE_URL=postgresql://user:password@localhost:5432/inventory_management
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
PORT=5000
CLIENT_URL=http://localhost:5173
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000
```

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login, returns access + refresh tokens |
| POST | `/auth/refresh` | Exchange refresh token for new access token |
| POST | `/auth/logout` | Revoke refresh token |
| GET/POST/PUT/DELETE | `/products` | Product CRUD |
| GET/POST/PUT/DELETE | `/categories` | Category CRUD |
| GET/POST/PUT/DELETE | `/suppliers` | Supplier CRUD |
| GET/POST/PUT/DELETE | `/customers` | Customer CRUD |
| GET/POST | `/sales-orders` | List / create sales orders |
| PUT | `/sales-orders/:id/status` | Transition order status |
| GET/POST | `/purchase-orders` | List / create purchase orders |
| PUT | `/purchase-orders/:id/status` | Transition order status |
| GET/POST | `/stock-movements` | Manual stock adjustments |
| GET | `/dashboard` | Aggregate dashboard data |
| GET | `/reports/monthly-revenue` | Raw SQL revenue report |
| GET | `/reports/inventory-valuation` | Raw SQL inventory valuation |
| GET | `/reports/product-performance` | Raw SQL top performers |
| GET/PUT/DELETE | `/users` | Admin user management |
| GET/PUT | `/profile` | Self-service profile |
| PUT | `/profile/password` | Change password |

---

## Author

Built as a hands-on learning project focused on relational database design, transactional integrity, and full-stack architecture with the PERN stack.
