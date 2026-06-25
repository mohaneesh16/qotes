import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function resolveDbUrl() {
  const url = process.env.DATABASE_URL;
  if (!url || url === "file:./dev.db") {
    return `file:${path.resolve(process.cwd(), "dev.db")}`;
  }
  if (url.startsWith("file:./") || url.startsWith("file:../")) {
    const relPath = url.slice("file:".length);
    return `file:${path.resolve(process.cwd(), relPath)}`;
  }
  return url;
}

function createPrismaClient() {
  const url = resolveDbUrl();
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const adapter = new PrismaLibSql({ url, ...(authToken ? { authToken } : {}) });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
