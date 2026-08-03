/**
 * Generates the 1200x630 social preview images that WhatsApp and Instagram
 * show when the owner pastes a product link into a DM. Product links are a
 * sales surface here, so every product gets its own.
 *
 * Runs automatically before `astro build` (see package.json).
 */
import sharp from 'sharp';
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { readFileSync } from 'node:fs';

const ROOT = process.cwd();
const ASSETS = path.join(ROOT, 'src/assets/products');
const OUT = path.join(ROOT, 'public/og');

const NAVY = { r: 17, g: 30, b: 52, alpha: 1 };
const W = 1200;
const H = 630;

const products = JSON.parse(readFileSync(path.join(ROOT, 'src/data/products.json'), 'utf8'));

async function heroPath(slug) {
  const dir = path.join(ASSETS, slug);
  const files = (await readdir(dir))
    .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
    .sort();
  if (!files.length) throw new Error(`no images for ${slug}`);
  return path.join(dir, files[0]);
}

await mkdir(OUT, { recursive: true });

const logo = await sharp(path.join(ROOT, 'public/shm-logo-white.png'))
  .resize({ height: 104 })
  .toBuffer();

/**
 * Fits the whole instrument inside the 1.91:1 unfurl rather than centre-
 * cropping it — a buyer scanning a DM needs to see the tool, not a zoom of
 * its middle. Every hero master is square, so this always needs left/right
 * padding to reach 1200×630.
 *
 * That padding is a flat brand-navy fill, not a mirror of the photo's own
 * edge: unlike the small top/bottom band ingest-images.mjs pads (pure
 * backdrop, safe to mirror), the left/right edge of a square product crop
 * often has real content close to it — the SHM watermark baked into the set
 * photos, an instrument tip near the frame edge. Mirroring that duplicates
 * and flips it into the pillarbox. A flat fill can only ever be a flat fill.
 */
async function makeOg(src, dest) {
  const photo = await sharp(src)
    .resize({ width: W, height: H, fit: 'contain', background: NAVY })
    .toBuffer();

  await sharp(photo)
    .composite([{ input: logo, top: 36, left: 44 }])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(dest);
}

for (const p of products) {
  await makeOg(await heroPath(p.slug), path.join(OUT, `${p.slug}.jpg`));
}

// Default preview for the homepage and any page without its own image.
await makeOg(await heroPath(products[0].slug), path.join(ROOT, 'public/og-default.jpg'));

console.log(`og: wrote ${products.length} product previews + og-default.jpg`);
