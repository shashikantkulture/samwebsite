import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // In production, reuse the same PrismaClient instance across function calls
  // to prevent exhausting connection limits.
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient({
      datasources: { db: { url: process.env.DATABASE_URL } },
    });
  }
  prisma = (global as any).prisma;
} else {
  // In development, a new instance per module reload is fine.
  prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
  });
}


export default prisma;
