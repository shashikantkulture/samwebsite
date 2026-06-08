// scripts/optimize-image.ts
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

/**
 * Optimize an image file to WebP (max width 1200px) and generate 1x and 2x versions.
 * Returns the relative URL (from project root) that can be used in Next.js <Image>.
 */
export async function optimizeImage(tmpPath: string, destDir: string, baseName: string): Promise<string> {
  // Ensure destination exists
  fs.mkdirSync(destDir, { recursive: true });

  const output1x = path.join(destDir, `${baseName}@1x.webp`);
  const output2x = path.join(destDir, `${baseName}@2x.webp`);

  // 1x version (max width 1200)
  await sharp(tmpPath)
    .resize({ width: 1200 })
    .toFormat('webp')
    .toFile(output1x);

  // 2x version (max width 2400) for high‑DPI screens
  await sharp(tmpPath)
    .resize({ width: 2400 })
    .toFormat('webp')
    .toFile(output2x);

  // Return the path that Next.js will serve (relative to the project root, starting with /)
  const relative = path.relative(path.resolve('public'), output1x);
  return `/${relative.replace(/\\/g, '/')}`;
}
