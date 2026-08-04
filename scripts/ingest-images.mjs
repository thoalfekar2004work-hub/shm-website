/**
 * One-time ingest: takes the owner's raw photo folders (which are named
 * descriptively, not by slug) and writes them into src/assets/products/<slug>/
 * with sorted, meaningful filenames.
 *
 * After this has run, the ongoing contract is the simple one from the spec:
 * drop a folder named exactly like the slug into src/assets/products/ and add
 * an entry to src/data/products.json. This script is kept only so the original
 * mapping is auditable and repeatable.
 *
 *   node scripts/ingest-images.mjs
 */
import sharp from 'sharp';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const SRC = '/Users/airboblh/Desktop/SHM/SHM PRODUCTS';
const OUT = path.join(process.cwd(), 'src/assets/products');
const PUBLIC = path.join(process.cwd(), 'public');

/** Longest edge for the ingested master image. Astro derives every responsive
 *  variant from this, so it only needs to be as large as the lightbox uses. */
const MASTER = 1600;
const QUALITY = 90;

/**
 * slug -> ordered list of source shots.
 * `crop` (optional) is applied before resize — used only to cut the burned-in
 * promotional price block off the two set photos. No pixels are painted or
 * retouched; the promo corner is simply outside the crop.
 */
const MAP = {
  'iris-scissors-red-curved': {
    dir: 'iris angled red scissores',
    shots: [
      ['call_j7IeLUEwSkefOjwcpY7Q6haI.png', '01-hero'],
      ['call_NEX9A8NUdH9zlyoPB5OLkqHJ.png', '02-full'],
      ['exec-248fee9a-b5ef-4d3a-8623-a62b6269cfe3.png', '03-tips-macro'],
      ['3E00F5D8-2196-410F-9D7D-F3091A26F363.PNG', '04-marking-macro'],
    ],
  },
  'iris-scissors-straight': {
    dir: 'iris straight',
    shots: [
      ['exec-fac85db4-3d74-4893-a611-5f81c26d8c8a.png', '01-hero'],
      ['exec-5c221e17-3368-4c37-801c-434a69f864a6.png', '02-tips-open'],
      ['exec-1abe946c-6526-43b1-a829-91906717c514.png', '03-tip-macro'],
      ['exec-4a7555b1-3ca4-49c6-8316-7e00a277b81d.png', '04-marking-macro'],
    ],
  },
  'iris-scissors-curved': {
    dir: 'IRIS scissores, curved ',
    shots: [
      ['exec-062c1f4d-5f0f-4507-aa64-d81004dbab14.png', '01-hero'],
      ['exec-423bf579-2a65-46b2-ab72-5c5af66ed099.png', '02-blade'],
      ['exec-a0e7925e-9454-4906-bdcd-f8694931d7c8.png', '03-tip-macro'],
    ],
  },
  'iris-scissors-rainbow': {
    dir: 'iris scissores, rainbow',
    shots: [['call_julHg06bNrDQRTX8f13sUCW8.png', '01-hero']],
  },
  'metzenbaum-scissors-blunt-curved': {
    dir: 'metenbum curved blunt',
    shots: [
      ['call_Gx03tTqmLS0DalnwvWO0EM7u.png', '01-hero'],
      ['call_BQuWiE9VOKce532K0QSnURYc.png', '02-full'],
      ['call_7NNehR8GfUHsEj770kKR5PU1.png', '03-tip-macro'],
    ],
  },
  'mayo-scissors-curved': {
    dir: 'mayo scissores curved',
    shots: [
      ['exec-e5e2024d-c3f3-460a-bb3c-309840981390.png', '01-hero'],
      ['exec-51492d5f-86c0-4b3b-88b9-7c341b3c0090.png', '02-tips-open'],
      ['exec-1b2c37cc-df82-474d-9ff2-f76d9652f1a3.png', '03-tip-macro'],
      ['exec-b236254b-46d2-4aec-90fa-b321623448f2.png', '04-marking-macro'],
    ],
  },
  'needle-holder-halsey-tc-12-5cm': {
    dir: 'needle holder',
    shots: [
      ['call_KpdTMACiFaemALflctB9GjYJ.png', '01-hero'],
      ['exec-41339c5a-71e7-4fe6-a3af-1618d1ae1271.png', '02-lock-macro'],
      ['exec-2344f770-05fb-47e4-9cc8-c080f6618bb0.png', '03-jaw-macro'],
      // Mirror-padding this one left a visible seam: the fabric has a real
      // lighting vignette here (not flat texture like the others), so the
      // mirrored reflection duplicates that gradient right at the fold. Flat
      // navy blends into the container background instead.
      ['exec-081d5f30-0e66-4385-8b9d-145ce746d9e1.png', '04-marking-macro', null, '#111E34'],
    ],
  },
  'forceps-adson-toothed-straight': {
    dir: 'adson forceps straight toothed',
    shots: [
      ['exec-e2bfa23a-2ea8-4b96-80a6-5631a9d47ac8.png', '01-hero'],
      ['exec-169fabbf-ee90-4594-a303-3c4ccb297bd6.png', '02-teeth-macro'],
    ],
  },
  'forceps-curved': {
    dir: 'adson forceps. straight and curved untoothed',
    shots: [
      ['call_2YK98KhUk9tRsN5ywvIw8aJw.png', '01-hero'],
      ['call_vQnCYXag5NdfCpzRBChoB2qE.png', '02-tip-macro'],
      ['call_dbhAQCWaWH8FqZx6PxNAM3TF.png', '03-in-hand'],
    ],
  },
  'hemostat-kelly-15cm': {
    dir: 'kelly mosquito 15cm',
    shots: [
      ['call_XJ2DYNW1FnLhx96zNeKKflJX.png', '01-hero'],
      ['call_qJYEejU51Bx8vLJIT8Clp98G.png', '02-jaw-macro'],
      ['call_7Ukw3wUgrH3K9e6pDR604e0E.png', '03-ratchet-macro'],
    ],
  },
  // Full graphics, owner's choice — the finished marketing asset (SHM logo,
  // struck-through price, "FREE DELIVERY") ships as-is, uncropped. Both
  // originals are already perfectly square, so no padding is needed either.
  'set-ent': {
    dir: 'ENT SET',
    shots: [['SHM_Natra_set_110000_to_100000_free_delivery.png', '01-hero']],
  },
  'set-general': {
    dir: 'GENERAL SET',
    shots: [['exec-6c853651-0330-4253-a784-5760e0d8dc8b.png', '01-hero']],
  },
};

/**
 * Pads a buffer out to a square by mirroring the image's own edge outward.
 *
 * First attempt at this stretched a thin 4px sliver of the edge to fill the
 * whole pad — on the fabric backdrop that turns fine weave noise into ugly
 * vertical streaks (visible on the ENT set photo). Mirroring reflects real
 * pixels 1:1 with no scaling, so the weave's texture and grain size carry
 * through unchanged and the seam disappears into it.
 */
async function padToSquare(buffer, flatColor) {
  const { width, height } = await sharp(buffer).metadata();
  if (width === height) return buffer;

  const side = Math.max(width, height);
  const top = width > height ? Math.floor((side - height) / 2) : 0;
  const bottom = width > height ? side - height - top : 0;
  const left = width > height ? 0 : Math.floor((side - width) / 2);
  const right = width > height ? 0 : side - width - left;

  return sharp(buffer)
    .extend(
      flatColor
        ? { top, bottom, left, right, extendWith: 'background', background: flatColor }
        : { top, bottom, left, right, extendWith: 'mirror' },
    )
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toBuffer();
}

async function ingest() {
  let count = 0;
  for (const [slug, { dir, shots }] of Object.entries(MAP)) {
    const dest = path.join(OUT, slug);
    await rm(dest, { recursive: true, force: true });
    await mkdir(dest, { recursive: true });

    for (const [file, name, crop, padColor] of shots) {
      const from = path.join(SRC, dir, file);
      if (!existsSync(from)) throw new Error(`missing source image: ${from}`);
      let img = sharp(from);
      if (crop) img = img.extract(crop);
      const resized = await img
        .resize({ width: MASTER, height: MASTER, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: QUALITY, mozjpeg: true })
        .toBuffer();

      const squared = await padToSquare(resized, padColor);
      await writeFile(path.join(dest, `${name}.jpg`), squared);
      count++;
    }
    console.log(`  ${slug.padEnd(34)} ${shots.length} image(s)`);
  }
  console.log(`\ningested ${count} images into src/assets/products/`);
}

/** Pull the SHM mark off the navy brand asset and derive alpha from luminance. */
async function logo() {
  const brand = path.join(SRC, 'ENT SET', 'SHM_Natra_set_110000_to_100000_free_delivery.png');
  // Generous box around the mark (measured at x 83..348, y 83..423) so no
  // stroke is clipped; the tight crop below is derived from the alpha mask.
  const BOX = { left: 50, top: 50, width: 380, height: 430 };
  const { data, info } = await sharp(brand).extract(BOX).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;

  const rgba = Buffer.alloc(W * H * 4);
  let minX = W, minY = H, maxX = 0, maxY = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * C;
      const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      const a = Math.max(0, Math.min(255, Math.round(((lum - 60) / 170) * 255)));
      const o = (y * W + x) * 4;
      rgba[o] = 255; rgba[o + 1] = 255; rgba[o + 2] = 255; rgba[o + 3] = a;
      if (a > 40) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  const pad = 6;
  const box = {
    left: Math.max(0, minX - pad),
    top: Math.max(0, minY - pad),
    width: Math.min(W, maxX - minX + 1 + pad * 2),
    height: Math.min(H, maxY - minY + 1 + pad * 2),
  };
  const mark = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
    .extract(box).png().toBuffer();

  await mkdir(PUBLIC, { recursive: true });
  await writeFile(path.join(PUBLIC, 'shm-logo-white.png'), mark);

  // navy-on-transparent variant for light surfaces (nav bar)
  await sharp(mark)
    .composite([{ input: { create: { width: box.width, height: box.height, channels: 4, background: '#111E34' } }, blend: 'in' }])
    .png().toFile(path.join(PUBLIC, 'shm-logo-navy.png'));

  // favicons + app icon: white mark centred on navy
  for (const size of [32, 180, 512]) {
    const inner = Math.round(size * 0.62);
    const scaled = await sharp(mark).resize({ height: inner, fit: 'inside' }).toBuffer();
    const m = await sharp(scaled).metadata();
    await sharp({ create: { width: size, height: size, channels: 4, background: '#111E34' } })
      .composite([{
        input: scaled,
        left: Math.round((size - m.width) / 2),
        top: Math.round((size - m.height) / 2),
      }])
      .png()
      .toFile(path.join(PUBLIC, size === 180 ? 'apple-touch-icon.png' : `icon-${size}.png`));
  }
  await sharp(path.join(PUBLIC, 'icon-32.png')).toFile(path.join(PUBLIC, 'favicon.png'));

  console.log(`logo + icons written to public/ (mark ${box.width}x${box.height})`);
}

await ingest();
await logo();
