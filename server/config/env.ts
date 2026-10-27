function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const JWT_ACCESS_SECRET = required("JWT_ACCESS_SECRET");
export const JWT_REFRESH_SECRET = required("JWT_REFRESH_SECRET");
