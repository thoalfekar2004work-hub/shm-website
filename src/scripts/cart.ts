/**
 * Cart state: client-side only, persisted in localStorage.
 * The cart stores slugs and quantities. Prices are never trusted from here —
 * /api/order recomputes every total from canonical product data.
 */
export interface CartLine {
  slug: string;
  qty: number;
}

const KEY = 'shm.cart';
const MAX_QTY = 20;
const MAX_LINES = 20;

export function readCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((l) => l && typeof l.slug === 'string' && Number.isInteger(l.qty) && l.qty > 0)
      .map((l) => ({ slug: l.slug, qty: Math.min(MAX_QTY, l.qty) }))
      .slice(0, MAX_LINES);
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    /* storage unavailable — cart lives for this page view only */
  }
  document.dispatchEvent(new CustomEvent('shm:cartchange', { detail: { lines } }));
}

export function addToCart(slug: string, qty = 1): CartLine[] {
  const lines = readCart();
  const existing = lines.find((l) => l.slug === slug);
  if (existing) {
    existing.qty = Math.min(MAX_QTY, existing.qty + qty);
  } else {
    if (lines.length >= MAX_LINES) return lines;
    lines.push({ slug, qty: Math.min(MAX_QTY, qty) });
  }
  writeCart(lines);
  return lines;
}

export function setQty(slug: string, qty: number): CartLine[] {
  let lines = readCart();
  if (qty <= 0) {
    lines = lines.filter((l) => l.slug !== slug);
  } else {
    const line = lines.find((l) => l.slug === slug);
    if (line) line.qty = Math.min(MAX_QTY, qty);
  }
  writeCart(lines);
  return lines;
}

export function removeFromCart(slug: string): CartLine[] {
  const lines = readCart().filter((l) => l.slug !== slug);
  writeCart(lines);
  return lines;
}

export function clearCart(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  document.dispatchEvent(new CustomEvent('shm:cartchange', { detail: { lines: [] } }));
}

export function cartCount(): number {
  return readCart().reduce((n, l) => n + l.qty, 0);
}

/** How many of one product are in the cart (0 if none). */
export function qtyOf(slug: string): number {
  return readCart().find((l) => l.slug === slug)?.qty ?? 0;
}

export const MAX_PER_LINE = MAX_QTY;

/** Keeps every cart badge on the page in sync. */
export function initCartBadge(): void {
  const paint = () => {
    const n = cartCount();
    document.querySelectorAll<HTMLElement>('[data-cart-count]').forEach((el) => {
      el.textContent = n ? String(n) : '';
      el.toggleAttribute('hidden', n === 0);
    });
  };
  paint();
  document.addEventListener('shm:cartchange', paint);
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) paint();
  });
}
