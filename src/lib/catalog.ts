/**
 * Catalog data layer.
 *
 * Loads products.json + categories.json, resolves each product's image folder
 * under src/assets/products/<slug>/, and validates the two together at build
 * time. A product entry with no image folder fails the build loudly (spec §3);
 * an image folder with no product entry only warns.
 */
import type { ImageMetadata } from 'astro';
import productsRaw from '../data/products.json';
import categoriesRaw from '../data/categories.json';
import type { Lang } from '../i18n/strings';

export interface Product {
  slug: string;
  category: string;
  name_en: string;
  name_ar: string;
  /** Kurdish (Sorani) fields are optional and fall back to English where
   * missing — see the note at the top of i18n/strings.ts about native review. */
  name_ku?: string;
  spec_line_en: string;
  price_iqd: number;
  size?: string;
  variant_en?: string;
  variant_ar?: string;
  variant_ku?: string;
  specialty_en?: string;
  specialty_ar?: string;
  specialty_ku?: string;
  specs_en?: string[];
  specs_ar?: string[];
  specs_ku?: string[];
  benefit_en?: string;
  benefit_ar?: string;
  benefit_ku?: string;
  contents_en?: string[];
  contents_ar?: string[];
  contents_ku?: string[];
  in_stock: boolean;
  low_stock: boolean;
  is_set: boolean;
  sort: number;
  /** Owner-flagged from real sales. Never inferred by the site. */
  best_seller?: boolean;
  /**
   * Not for sale yet. `price_iqd` is a 0 placeholder for these — no real
   * price exists, so nothing in the UI may render it; the product is never
   * addable to cart, only pre-orderable via WhatsApp.
   */
  coming_soon?: boolean;
  /**
   * A genuine time-limited offer.
   *
   * `price_iqd` above is always the price actually charged — the timer never
   * changes what a customer pays, so a clock skew or an expiry racing a
   * checkout can't produce a wrong total. `was_iqd` is the higher reference
   * price shown struck through, and the whole block disappears by itself once
   * `ends` passes.
   */
  promo?: {
    was_iqd: number;
    /** ISO 8601 with offset, e.g. "2026-08-03T21:00:00+03:00". */
    ends: string;
  };
}

export interface Category {
  slug: string;
  name_en: string;
  name_ar: string;
  name_ku?: string;
  tile_product: string;
  sort: number;
}

/** Every image under src/assets/products/, keyed by path. */
const imageModules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/products/*/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

/** slug -> alphabetically sorted image list (first entry is the hero). */
const imagesBySlug = new Map<string, ImageMetadata[]>();
for (const [path, mod] of Object.entries(imageModules)) {
  const slug = path.split('/').at(-2)!;
  if (!imagesBySlug.has(slug)) imagesBySlug.set(slug, []);
  imagesBySlug.get(slug)!.push(mod.default);
}
for (const [slug, list] of imagesBySlug) {
  list.sort((a, b) => a.src.localeCompare(b.src));
  imagesBySlug.set(slug, list);
}

export const products = (productsRaw as Product[])
  .slice()
  .sort((a, b) => a.sort - b.sort);

export const categories = (categoriesRaw as Category[])
  .slice()
  .sort((a, b) => a.sort - b.sort);

// --- build-time validation -------------------------------------------------

const missingFolders = products.filter((p) => !imagesBySlug.get(p.slug)?.length);
if (missingFolders.length) {
  throw new Error(
    `[catalog] ${missingFolders.length} product(s) in products.json have no images:\n` +
      missingFolders.map((p) => `  - ${p.slug}  (expected src/assets/products/${p.slug}/01-hero.jpg)`).join('\n') +
      `\nAdd the image folder, or move the entry to src/data/products-pending-photos.json.`,
  );
}

const productSlugs = new Set(products.map((p) => p.slug));
for (const slug of imagesBySlug.keys()) {
  if (!productSlugs.has(slug)) {
    console.warn(`[catalog] warning: image folder "${slug}" has no entry in products.json — not published.`);
  }
}

for (const p of products) {
  if (!p.promo) continue;
  const { was_iqd, ends } = p.promo;
  if (!Number.isFinite(was_iqd) || was_iqd <= p.price_iqd) {
    throw new Error(
      `[catalog] "${p.slug}" promo.was_iqd (${was_iqd}) must be higher than price_iqd (${p.price_iqd}) — ` +
        `a struck-through price that is not actually higher misleads the customer.`,
    );
  }
  if (Number.isNaN(Date.parse(ends))) {
    throw new Error(
      `[catalog] "${p.slug}" promo.ends is not a valid date: "${ends}". ` +
        `Use ISO 8601 with the Baghdad offset, e.g. "2026-08-03T21:00:00+03:00".`,
    );
  }
  if (Date.parse(ends) <= Date.now()) {
    console.warn(
      `[catalog] warning: "${p.slug}" promo already ended (${ends}) — it will not be shown.`,
    );
  }
}

const catSlugs = new Set(categories.map((c) => c.slug));
for (const p of products) {
  if (!p.is_set && !catSlugs.has(p.category)) {
    throw new Error(`[catalog] product "${p.slug}" has unknown category "${p.category}".`);
  }
}
for (const c of categories) {
  if (!productSlugs.has(c.tile_product)) {
    throw new Error(
      `[catalog] category "${c.slug}" points at tile_product "${c.tile_product}", which is not a published product.`,
    );
  }
  if (!productsInCategory(c.slug).length) {
    console.warn(`[catalog] warning: category "${c.slug}" has no published products.`);
  }
}

// --- accessors -------------------------------------------------------------

export function imagesFor(slug: string): ImageMetadata[] {
  return imagesBySlug.get(slug) ?? [];
}

export function heroFor(slug: string): ImageMetadata {
  const list = imagesFor(slug);
  if (!list.length) throw new Error(`[catalog] no images for "${slug}"`);
  return list[0];
}

export function productsInCategory(categorySlug: string): Product[] {
  return products.filter((p) => !p.is_set && p.category === categorySlug);
}

export const sets = products.filter((p) => p.is_set);

/**
 * Whether an offer is still running. Called at build time for the initial
 * render; the client re-checks on a timer and removes the offer when it ends,
 * so a page cached mid-offer cannot keep showing a stale one.
 */
export function promoActive(p: Product, now: number = Date.now()): boolean {
  if (!p.promo) return false;
  const ends = Date.parse(p.promo.ends);
  return Number.isFinite(ends) && ends > now;
}

/** Catalog products (everything that is not a set). */
export const catalogProducts = products.filter((p) => !p.is_set);

export function bySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function lowestPriceIn(categorySlug: string): number {
  const list = productsInCategory(categorySlug).filter((p) => !p.coming_soon);
  return list.reduce((min, p) => Math.min(min, p.price_iqd), Infinity);
}

export function name(p: Product, lang: Lang): string {
  if (lang === 'ar') return p.name_ar;
  if (lang === 'ku') return p.name_ku ?? p.name_en;
  return p.name_en;
}

export function specs(p: Product, lang: Lang): string[] {
  if (lang === 'ar') return p.specs_ar ?? [];
  if (lang === 'ku') return p.specs_ku ?? p.specs_en ?? [];
  return p.specs_en ?? [];
}

export function benefit(p: Product, lang: Lang): string | undefined {
  if (lang === 'ar') return p.benefit_ar;
  if (lang === 'ku') return p.benefit_ku ?? p.benefit_en;
  return p.benefit_en;
}

export function contents(p: Product, lang: Lang): string[] {
  if (lang === 'ar') return p.contents_ar ?? [];
  if (lang === 'ku') return p.contents_ku ?? p.contents_en ?? [];
  return p.contents_en ?? [];
}

export function specialty(p: Product, lang: Lang): string | undefined {
  if (lang === 'ar') return p.specialty_ar;
  if (lang === 'ku') return p.specialty_ku ?? p.specialty_en;
  return p.specialty_en;
}

export function categoryName(c: Category, lang: Lang): string {
  if (lang === 'ar') return c.name_ar;
  if (lang === 'ku') return c.name_ku ?? c.name_en;
  return c.name_en;
}

/**
 * Alt text for a product shot. Uses the English product name plus a shot
 * description derived from the filename — never a country-of-origin word.
 */
export function altFor(p: Product, img: ImageMetadata, index: number): string {
  const file = img.src.split('/').at(-1) ?? '';
  const stem = file.replace(/\.[a-z0-9]+$/i, '').replace(/^\d+-/, '').replace(/-[A-Za-z0-9_]{6,}$/, '');
  const shot = stem.replace(/-/g, ' ').trim();
  if (!shot || shot === 'hero' || index === 0) return p.name_en;
  return `${p.name_en} — ${shot}`;
}

/** Small client-side search index (spec §4). */
export const searchIndex = products.map((p) => ({
  s: p.slug,
  ar: p.name_ar,
  en: p.name_en,
  ku: p.name_ku ?? p.name_en,
  sp: p.spec_line_en,
  p: p.price_iqd,
  cs: p.coming_soon ?? false,
}));
