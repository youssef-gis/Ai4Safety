// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma || new PrismaClient();

// export const db = prisma.$extends({
//   query: {
//     organization: {
//       async findMany({ args, query }) {
//         args.where = { deletedAt: null, ...args.where }
//         return query(args)
//       },
//       async findFirst({ args, query }) {
//         args.where = { deletedAt: null, ...args.where }
//         return query(args)
//       },
//       async findUnique({ args, query }) {
//         // findUnique requires exact ID, so we trick it by changing to findFirst
//         // or we handle logic manually. 
//         // Safer approach for findUnique is typically to NOT filter automatically 
//         // to avoid "Record not found" confusion when it actually exists but is deleted.
//         return query(args) 
//       },
//     },
//     project: {
//       async findMany({ args, query }) {
//         args.where = { deletedAt: null, ...args.where }
//         return query(args)
//       },
//       async findFirst({ args, query }) {
//         args.where = { deletedAt: null, ...args.where }
//         return query(args)
//       },
//     },
//     // Add other soft-delete models here if needed
//   },
// })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;