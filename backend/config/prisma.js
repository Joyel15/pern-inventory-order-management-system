import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const { PrismaClient } = pkg;

// The adapter is what actually opens the TCP connection to Postgres.
// Prisma Client now delegates all real database communication to it,
// rather than connecting directly itself.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({ adapter });

export default prisma;