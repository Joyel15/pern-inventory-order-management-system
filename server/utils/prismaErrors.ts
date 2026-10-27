// Prisma errors carry a "code" like "P2002" (unique value already exists).
// In a catch block, TypeScript calls the error "unknown", so we check it first.
export function hasPrismaCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === code
  );
}
