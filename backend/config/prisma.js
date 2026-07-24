import { PrismaClient } from "../../generated/prisma/index.js";

// Create a single, shared Prisma Client instance.
// Every controller/service imports THIS file instead of
// instantiating their own PrismaClient — this avoids
// exhausting the Postgres connection pool.
const prisma = new PrismaClient();

export default prisma;