// prisma/seed.ts
import { execSync } from 'child_process';

// Run the import script which populates the DB and generates static JSON files
execSync('npm run import', { stdio: 'inherit' });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  // Create admin user if not exists
  const adminEmail = 'admin@sam.com';
  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!adminExists) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        fullName: 'Admin User',
        role: 'admin',
      },
    });
    console.log('✅ Admin user created');
  } else {
    console.log('✅ Admin user already exists');
  }

  // Seed default categories
  const defaultCategories = ['Hair Care', 'Skin Care', 'Fragrance', 'Accessories'];
  for (const name of defaultCategories) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }
  console.log('✅ Categories seeded');

  // Seed a sample product
  const sampleProduct = await prisma.product.upsert({
    where: { slug: 'luxury-hair-serum' },
    update: {},
    create: {
      name: 'Luxury Hair Serum',
      slug: 'luxury-hair-serum',
      description: 'Premium serum for brilliant shine and strength.',
      price: 199.99,
      salePrice: 149.99,
      category: { connect: { slug: 'hair-care' } },
      stock: 50,
      featured: true,
      imageUrl: '/uploads/products/sample-serum.jpg',
    },
  });
  console.log('✅ Sample product seeded:', sampleProduct.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
