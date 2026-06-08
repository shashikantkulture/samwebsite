// scripts/scrapeProducts.ts
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const IMAGE_DIR = path.resolve(__dirname, '../../public/images/products');
fs.mkdirSync(IMAGE_DIR, { recursive: true });

async function downloadImage(url: string, filename: string): Promise<string> {
  const resp = await axios.get(url, { responseType: 'arraybuffer' });
  const filePath = path.join(IMAGE_DIR, filename);
  fs.writeFileSync(filePath, resp.data);
  // Return the relative path used by Next.js static assets
  return `/images/products/${filename}`;
}

async function scrape() {
  const base = 'https://www.sammrenaissance.com';
  const apiUrl = `${base}/collections/all/products.json?limit=250`;
  const resp = await axios.get(apiUrl);
  const products = resp.data.products || [];

  for (const p of products) {
    const title = p.title?.trim() || '';
    const price = Number(p.variants?.[0]?.price || 0);
    const description = p.body_html ? p.body_html.replace(/<[^>]+>/g, '').trim() : '';
    const imgUrl = p.images?.[0]?.src || '';
    let localImg = '';
    if (imgUrl) {
      const filename = path.basename(new URL(imgUrl).pathname);
      localImg = await downloadImage(imgUrl, filename);
    }
    const slug = slugify(title, { lower: true, strict: true }) || String(Date.now());
    await prisma.product.create({
      data: {
        name: title,
        slug,
        price,
        description,
        imageUrl: localImg,
        // category can be added later if needed
      },
    });
    console.log(`Imported: ${title}`);
  }
}

scrape()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
