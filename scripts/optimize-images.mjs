// Convierte las imágenes originales de Stitch (JPG) a WebP optimizado.
// Uso: node scripts/optimize-images.mjs <carpeta-con-jpg-originales>
import sharp from 'sharp';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

const src = process.argv[2];
if (!src) { console.error('Indica la carpeta de origen'); process.exit(1); }
const out = path.resolve('assets/img');

for (const f of (await readdir(src)).filter((n) => n.endsWith('.jpg'))) {
  const name = path.basename(f, '.jpg');
  const isMobile = name.startsWith('m-');
  const img = sharp(path.join(src, f)).rotate();
  await img.clone()
    .resize({ width: isMobile ? 704 : 1312, withoutEnlargement: true })
    .webp({ quality: 78, effort: 6 })
    .toFile(path.join(out, `${name}.webp`));
  console.log('✓', `${name}.webp`);
}

// Imagen Open Graph (JPG 1200×630: máxima compatibilidad con WhatsApp/Facebook)
await sharp(path.join(src, 'd-hero.jpg'))
  .resize(1200, 630, { fit: 'cover', position: 'attention' })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(path.join(out, 'og-hero.jpg'));
console.log('✓ og-hero.jpg');
