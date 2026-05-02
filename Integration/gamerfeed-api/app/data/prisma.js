// import { PrismaClient } from "@prisma/client";
import { PrismaClient } from "../generated/prisma/client.js";


const globalForPrisma = globalThis;

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ["query", "error", "warn"],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}