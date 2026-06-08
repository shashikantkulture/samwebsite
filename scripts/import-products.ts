// scripts/import-products.ts
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import slugify from 'slugify';
import { PrismaClient } from '@prisma/client';
import { optimizeImage } from './optimize-image';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const prisma = new PrismaClient();

const IMAGE_ROOT = path.resolve(__dirname, '../../public/images/products');
fs.mkdirSync(IMAGE_ROOT, { recursive: true });

async function downloadAndOptimize(url: string, destDir: string, baseName: string): Promise<string> {
  const resp = await axios.get(url, { responseType: 'arraybuffer' });
  const tmpPath = path.join(destDir, `${baseName}.tmp`);
  fs.writeFileSync(tmpPath, resp.data);
  // Optimize to WebP (max width 1200) and generate responsive versions
  const optimizedRelPath = await optimizeImage(tmpPath, destDir, baseName);
  // Remove temporary file
  fs.unlinkSync(tmpPath);
  return optimizedRelPath;
}

async function importCatalog() {
  const base = 'https://www.sammrenaissance.com';
  const apiUrl = `${base}/collections/all/products.json?limit=250`;
  const { data } = await axios.get(apiUrl);
  const products = data.products || [];

  for (const p of products) {
    const slug = slugify(p.title, { lower: true, strict: true });
    const categoryName = p.product_type || 'uncategorized';
    const categorySlug = slugify(categoryName, { lower: true, strict: true });
    const categoryDir = path.join(IMAGE_ROOT, categorySlug);
    fs.mkdirSync(categoryDir, { recursive: true });

    // Upsert Category
    const category = await prisma.category.upsert({
      where: { slug: categorySlug },
      update: {},
      create: { name: categoryName, slug: categorySlug },
    });

    // Download and optimize images
    const imageUrls = (p.images || []).map((i: any) => i.src).filter(Boolean);
    const imageRecords: any[] = [];
    for (let i = 0; i < imageUrls.length; i++) {
      const imgUrl = imageUrls[i];
      const baseName = `${slug}-${i + 1}`;
      const relPath = await downloadAndOptimize(imgUrl, categoryDir, baseName);
      const imgRec = await prisma.productImage.create({
        data: { url: relPath },
      });
      imageRecords.push(imgRec);
    }

    // Upsert Product
    const product = await prisma.product.upsert({
      where: { sku: p.variants?.[0]?.sku || slug },
      update: {},
      create: {
        name: p.title,
        slug,
        description: p.body_html ? p.body_html.replace(/<[^>]+>/g, '').trim() : '',
        price: Number(p.variants?.[0]?.price || 0),
        salePrice: p.variants?.[0]?.compare_at_price ? Number(p.variants[0].compare_at_price) : null,
        sku: p.variants?.[0]?.sku || slug,
        categoryId: category.id,
        imageUrl: imageRecords[0]?.url ?? null,
        featuredImageId: imageRecords[0]?.id ?? null,
        images: { connect: imageRecords.map(img => ({ id: img.id })) },
        tags: JSON.stringify(Array.isArray(p.tags) ? p.tags.map((t: any) => String(t).trim()) : typeof p.tags === 'string' ? p.tags.split(',').map((t: string) => t.trim()) : []),
        specifications: p.options ? JSON.stringify(p.options.reduce((acc: any, opt: any) => ({ ...acc, [opt.name]: opt.values }), {})) : null,
      },
    });

    // Variants
    for (const v of p.variants || []) {
      if (!v.sku) continue; // skip variants without SKU
      await prisma.variant.upsert({
        where: { sku: v.sku },
        update: {},
        create: {
          sku: v.sku,
          price: Number(v.price),
          salePrice: v.compare_at_price ? Number(v.compare_at_price) : null,
          attributes: v.options ? JSON.stringify(v.options.reduce((a: any, opt: any) => ({ ...a, [opt.name]: opt.value }), {})) : null,
          productId: product.id,
        },
      });
    }

    console.log(`Imported product: ${p.title}`);
  }

  // Write static JSON files for later use
  const allProducts = await prisma.product.findMany({
    include: { images: true, variants: true, category: true },
  });
  const allCategories = await prisma.category.findMany();
  fs.writeFileSync(path.resolve('data', 'products.json'), JSON.stringify(allProducts, null, 2));
  fs.writeFileSync(path.resolve('data', 'categories.json'), JSON.stringify(allCategories, null, 2));
}

importCatalog()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
