/**
 * Validation shared by the checkout form and /api/order.
 * Kept in one place so the client and the server can never drift apart.
 * The server still re-runs all of it — the client copy is only for fast feedback.
 */

export const LIMITS = {
  name: 80,
  address: 300,
  maxQty: 20,
  maxLines: 20,
} as const;

/**
 * Flat delivery charge, paid by the customer, same for every governorate.
 * Defined here because the cart, the checkout summary and the server all have
 * to agree on it — the server is what actually decides the amount charged.
 */
export const DELIVERY_FEE_IQD = 5000;

/**
 * Delivery is free when the order includes any set — the set's own page
 * advertises this, so checkout has to actually honor it. One free-delivery
 * item in a mixed cart waives the flat fee for the whole order rather than
 * trying to prorate a charge that was never itemized per line.
 */
export function deliveryFeeFor(items: { is_set?: boolean }[]): number {
  return items.some((it) => it.is_set) ? 0 : DELIVERY_FEE_IQD;
}

/**
 * Iraqi keyboards default to Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩), so a phone
 * number typed while the keyboard is in Arabic mode arrives full of those,
 * not "0-9" — without this, a completely valid number fails validation for
 * a reason no customer would ever guess. Extended Arabic-Indic (Persian/Urdu
 * keyboards, ۰۱۲۳۴۵۶۷۸۹) is included too since it costs nothing to cover.
 */
function toWesternDigits(input: string): string {
  return input.replace(/[٠-٩۰-۹]/g, (d) => {
    const code = d.codePointAt(0)!;
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
  });
}

/**
 * Iraqi mobile numbers. Converts Arabic-Indic digits to Western, strips
 * spaces, dashes and parentheses, converts a +964 / 964 / 00964 prefix to a
 * leading 0, then requires 07XXXXXXXXX.
 */
export function normalizePhone(input: string): string {
  let s = toWesternDigits(String(input ?? ''))
    .replace(/[\s\-().]/g, '')
    .replace(/^\+/, '');
  if (s.startsWith('00964')) s = s.slice(5);
  else if (s.startsWith('964')) s = s.slice(3);
  if (!s.startsWith('0')) s = '0' + s;
  return s;
}

export const PHONE_RE = /^07[0-9]{9}$/;

export function isValidPhone(input: string): boolean {
  return PHONE_RE.test(normalizePhone(input));
}

export const GOVERNORATES = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'السليمانية', 'دهوك',
  'كركوك', 'الأنبار', 'بابل', 'كربلاء', 'النجف', 'الديوانية',
  'ذي قار', 'ميسان', 'المثنى', 'واسط', 'صلاح الدين', 'ديالى',
];

export interface OrderItem {
  slug: string;
  qty: number;
}

export interface OrderPayload {
  name: string;
  phone: string;
  governorate: string;
  address: string;
  items: OrderItem[];
  /** Honeypot — must be empty. */
  company?: string;
}

export type ValidationResult =
  | { ok: true; value: Omit<OrderPayload, 'company'> }
  | { ok: false; error: string };

/**
 * Validates an order payload. `knownSlugs` comes from canonical product data,
 * so the server rejects anything the catalog does not contain.
 */
export function validateOrder(raw: unknown, knownSlugs: Set<string>): ValidationResult {
  if (!raw || typeof raw !== 'object') return { ok: false, error: 'invalid body' };
  const b = raw as Record<string, unknown>;

  const name = String(b.name ?? '').trim();
  if (!name) return { ok: false, error: 'name required' };
  if (name.length > LIMITS.name) return { ok: false, error: 'name too long' };

  const phone = normalizePhone(String(b.phone ?? ''));
  if (!PHONE_RE.test(phone)) return { ok: false, error: 'invalid phone' };

  const governorate = String(b.governorate ?? '').trim();
  if (!GOVERNORATES.includes(governorate)) return { ok: false, error: 'invalid governorate' };

  const address = String(b.address ?? '').trim();
  if (!address) return { ok: false, error: 'address required' };
  if (address.length > LIMITS.address) return { ok: false, error: 'address too long' };

  if (!Array.isArray(b.items) || b.items.length === 0) {
    return { ok: false, error: 'no items' };
  }
  if (b.items.length > LIMITS.maxLines) return { ok: false, error: 'too many items' };

  const items: OrderItem[] = [];
  const seen = new Set<string>();
  for (const it of b.items) {
    if (!it || typeof it !== 'object') return { ok: false, error: 'invalid item' };
    const slug = String((it as any).slug ?? '');
    const qty = (it as any).qty;
    if (!knownSlugs.has(slug)) return { ok: false, error: `unknown item: ${slug}` };
    if (seen.has(slug)) return { ok: false, error: `duplicate item: ${slug}` };
    if (!Number.isInteger(qty) || qty < 1 || qty > LIMITS.maxQty) {
      return { ok: false, error: 'invalid quantity' };
    }
    seen.add(slug);
    items.push({ slug, qty });
  }

  return { ok: true, value: { name, phone, governorate, address, items } };
}
