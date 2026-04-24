import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "./client";

const globalForPrisma = globalThis;
let prisma;

if (!globalForPrisma.prisma) {
  const adapter = new PrismaLibSql({
    url: "file:prisma/db/dev.db", // ✅ match schema.prisma path
  });
  globalForPrisma.prisma = new PrismaClient({ adapter });
}

prisma = globalForPrisma.prisma;

export { prisma };          // ← named export
export default prisma;      // ← keep default too