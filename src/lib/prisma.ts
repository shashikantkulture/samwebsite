import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

const getPrismaOptions = () => {
  const options: any = {};
  if (process.env.DATABASE_URL) {
    options.datasources = { db: { url: process.env.DATABASE_URL } };
  } else {
    // Fallback default for local SQLite build environment stability
    options.datasources = { db: { url: "file:./prisma/dev.db" } };
  }
  return options;
};

if (process.env.NODE_ENV === 'production') {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient(getPrismaOptions());
  }
  prisma = (global as any).prisma;
} else {
  prisma = new PrismaClient(getPrismaOptions());
}

export default prisma;
