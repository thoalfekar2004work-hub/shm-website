/**
 * POST /api/order — Cloudflare Pages Function.
 *
 * A website order is a lead, not a sale: no payment, no account. This endpoint
 * validates the submission, recomputes every total from canonical product data,
 * sends the owner a Telegram message (the critical path), and appends a row to
 * a Notion database (best effort).
 *
 * Env vars (Pages → Settings → Environment variables, or .dev.vars locally):
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, NOTION_TOKEN, NOTION_ORDERS_DB_ID
 */
import productsData from '../../src/data/products.json';
import { validateOrder, deliveryFeeFor } from '../../src/lib/order-shared';

/**
 * Exported so src/worker.ts (the real production entry point — see its
 * top-of-file comment for why this file alone isn't enough) can share the
 * same environment shape.
 */
export interface Env {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  NOTION_TOKEN?: string;
  NOTION_ORDERS_DB_ID?: string;
  /** Test seam: lets a local run point at a mock instead of Telegram. Unset in production. */
  TELEGRAM_API_BASE?: string;
}

interface CatalogProduct {
  slug: string;
  name_en: string;
  name_ar: string;
  spec_line_en: string;
  price_iqd: number;
  size?: string;
  is_set?: boolean;
}

const products = productsData as CatalogProduct[];
const bySlug = new Map(products.map((p) => [p.slug, p]));
const knownSlugs = new Set(bySlug.keys());

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

const money = (n: number) => n.toLocaleString('en-US');

/** Baghdad has no DST, so a fixed +03:00 offset is correct year-round. */
function baghdadTimestamp(now: Date): string {
  const t = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    `${t.getUTCFullYear()}-${p(t.getUTCMonth() + 1)}-${p(t.getUTCDate())} ` +
    `${p(t.getUTCHours())}:${p(t.getUTCMinutes())} (Baghdad)`
  );
}

async function handleOrder(request: Request, env: Env): Promise<Response> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ error: 'invalid json' }, 400);
  }

  // Honeypot: a filled "company" field means a bot. Return a plausible success
  // and do nothing at all.
  const honeypot = (raw as Record<string, unknown> | null)?.company;
  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    return json({ ok: true });
  }

  const result = validateOrder(raw, knownSlugs);
  if (!result.ok) return json({ error: result.error }, 400);

  const { name, phone, governorate, address, items } = result.value;

  // Totals are recomputed here; nothing about price comes from the client.
  const lines = items.map((it) => {
    const p = bySlug.get(it.slug)!;
    const subtotal = p.price_iqd * it.qty;
    return { ...it, product: p, subtotal };
  });
  const goodsTotal = lines.reduce((sum, l) => sum + l.subtotal, 0);
  // Flat delivery charge, same for every governorate — waived when the
  // order includes a set.
  const deliveryFee = deliveryFeeFor(lines.map((l) => l.product));
  const total = goodsTotal + deliveryFee;

  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    console.error('[order] Telegram env vars are not configured');
    return json({ error: 'notification channel unavailable' }, 500);
  }

  const itemLines = lines
    .map((l) => {
      const size = l.product.size ? ` (${l.product.size})` : '';
      return `• ${l.product.name_en}${size} ×${l.qty} = ${money(l.subtotal)} IQD`;
    })
    .join('\n');

  const message = [
    '🛒 طلب جديد — SHM Website',
    '',
    `👤 الاسم: ${name}`,
    `📱 الهاتف: ${phone}`,
    `📍 المحافظة: ${governorate}`,
    `🏠 العنوان: ${address}`,
    '',
    'المنتجات:',
    itemLines,
    '',
    `🧾 مجموع المنتجات: ${money(goodsTotal)} IQD`,
    deliveryFee > 0
      ? `🚚 التوصيل: ${money(deliveryFee)} IQD`
      : '🚚 التوصيل: مجاني',
    `💰 المجموع: ${money(total)} IQD`,
    `🕐 ${baghdadTimestamp(new Date())}`,
  ].join('\n');

  // --- Telegram: critical path. If this fails, the order failed. ---
  try {
    const base = env.TELEGRAM_API_BASE || 'https://api.telegram.org';
    const res = await fetch(
      `${base}/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text: message,
          disable_web_page_preview: true,
        }),
      },
    );
    if (!res.ok) {
      console.error(`[order] Telegram responded ${res.status}`);
      return json({ error: 'could not deliver order' }, 500);
    }
  } catch (err) {
    console.error('[order] Telegram request failed', err instanceof Error ? err.message : err);
    return json({ error: 'could not deliver order' }, 500);
  }

  // --- Notion: best effort. The owner already has the lead. ---
  if (env.NOTION_TOKEN && env.NOTION_ORDERS_DB_ID) {
    try {
      const res = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${env.NOTION_TOKEN}`,
          'notion-version': '2022-06-28',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          parent: { database_id: env.NOTION_ORDERS_DB_ID },
          properties: {
            Customer: { title: [{ text: { content: name } }] },
            Phone: { phone_number: phone },
            Governorate: { select: { name: governorate } },
            Address: { rich_text: [{ text: { content: address } }] },
            Items: {
              rich_text: [
                {
                  text: {
                    // Delivery is listed so the row reconciles with Total IQD.
                    content: [
                      ...lines.map((l) => `${l.slug} ×${l.qty} = ${money(l.subtotal)}`),
                      `delivery = ${money(deliveryFee)}`,
                    ].join('\n'),
                  },
                },
              ],
            },
            'Total IQD': { number: total },
            Status: { select: { name: 'New lead' } },
          },
        }),
      });
      if (!res.ok) {
        console.error(`[order] Notion responded ${res.status}: ${await res.text()}`);
      }
    } catch (err) {
      console.error('[order] Notion request failed', err instanceof Error ? err.message : err);
    }
  } else {
    console.error('[order] Notion env vars are not configured — order logged to Telegram only');
  }

  return json({ ok: true, total });
}

/**
 * POST only — every other method is rejected outright. Shared by both
 * production entry points: the classic Pages Functions export below, and
 * src/worker.ts's plain `fetch` handler (the one actually used in prod — see
 * that file's top comment).
 */
export async function handleOrderRequest(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method not allowed' }), {
      status: 405,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        allow: 'POST',
      },
    });
  }
  return handleOrder(request, env);
}

/** Classic Pages Functions entry point — kept for `wrangler pages dev` and
 *  in case this ever runs as a real git-connected Pages project. Production
 *  right now is a Workers-with-assets project and uses src/worker.ts instead. */
export const onRequest: PagesFunction<Env> = ({ request, env }) =>
  handleOrderRequest(request, env);
