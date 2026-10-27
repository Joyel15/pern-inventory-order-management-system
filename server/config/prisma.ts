import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DATABASE_URL } from "./env.js";

// The adapter is what actually opens the TCP connection to Postgres.
// Prisma Client now delegates all real database communication to it,
// rather than connecting directly itself.
const adapter = new PrismaPg({ connectionString: DATABASE_URL });

const prisma = new PrismaClient({ adapter });

export default prisma;
