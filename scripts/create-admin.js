import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:C:/Users/hacke/Downloads/sam/samwebsite/prisma/dev.db'
    }
  }
});

async function main() {
  const adminEmail = 'admin@sam.com';
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: 'admin',
    },
    create: {
      email: adminEmail,
      passwordHash,
      fullName: 'Admin User',
      role: 'admin',
    },
  });
  console.log('✅ Admin user created successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
