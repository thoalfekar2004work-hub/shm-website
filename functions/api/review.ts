/**
 * Review submission, moderation, and public listing.
 *
 * A review is a lead too, same as an order: no account needed. A visitor
 * submits name + star rating + text; it's stored in KV as "pending" and the
 * owner gets a Telegram message with plain Approve/Reject links. There's no
 * Telegram webhook here — tapping a link just hits this same Worker over
 * HTTPS, matching how everything else in this codebase talks to Telegram:
 * send-only, no inbound updates to verify.
 *
 * Env vars: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (the same ones /api/order
 * uses), plus the REVIEWS KV binding (see wrangler.toml) and SITE_URL for
 * building the approve/reject links.
 */
import { validateReview } from '../../src/lib/review-shared';

export interface Env {
  REVIEWS: KVNamespace;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  SITE_URL?: string;
  /** Test seam: lets a local run point at a mock instead of Telegram. Unset in production. */
  TELEGRAM_API_BASE?: string;
}

interface ReviewRecord {
  id: string;
  name: string;
  rating: number;
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  /** Guards the approve/reject links — without it, a guessed id could moderate someone else's review. */
  token: string;
  createdAt: string;
}

interface PublicReview {
  name: string;
  rating: number;
  text: string;
  createdAt: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

/** Plain confirmation page — this is what opens when the owner taps a Telegram link. */
function confirmPage(message: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SHM</title>
<style>
  body { font-family: system-ui, sans-serif; background: #111e34; color: #fff;
    display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 24px; text-align: center; }
  p { font-size: 1.15rem; max-width: 40ch; line-height: 1.6; }
</style>
</head>
<body><p>${message}</p></body>
</html>`;
}

function htmlResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    // Never let a browser, proxy, or Cloudflare's edge cache reuse a stale
    // response for a moderation link — each tap has to hit the Worker fresh.
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}

async function sendTelegramReviewNotice(env: Env, record: ReviewRecord): Promise<void> {
  const base = env.TELEGRAM_API_BASE || 'https://api.telegram.org';
  const site = env.SITE_URL || 'https://shm-website.thoalfekar2004work.workers.dev';
  const approveUrl = `${site}/api/review/approve?id=${record.id}&token=${record.token}`;
  const rejectUrl = `${site}/api/review/reject?id=${record.id}&token=${record.token}`;
  const stars = '⭐'.repeat(record.rating) + '☆'.repeat(5 - record.rating);

  const message = [
    '💬 New review — SHM Website',
    '',
    `👤 ${record.name}`,
    stars,
    '',
    record.text,
    '',
    `✅ Approve: ${approveUrl}`,
    `❌ Reject: ${rejectUrl}`,
  ].join('\n');

  const res = await fetch(`${base}/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text: message,
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    console.error(`[review] Telegram responded ${res.status}`);
  }
}

/** POST /api/review — a visitor submitting a new review. */
export async function handleReviewSubmit(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'method not allowed' }, 405);
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ error: 'invalid json' }, 400);
  }

  // Honeypot, same convention as /api/order: a filled "company" field means
  // a bot. Return a plausible success and do nothing at all.
  const honeypot = (raw as Record<string, unknown> | null)?.company;
  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    return json({ ok: true });
  }

  const result = validateReview(raw);
  if (!result.ok) return json({ error: result.error }, 400);

  if (!env.REVIEWS) {
    console.error('[review] REVIEWS KV binding is not configured');
    return json({ error: 'storage unavailable' }, 500);
  }
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    console.error('[review] Telegram env vars are not configured');
    return json({ error: 'notification channel unavailable' }, 500);
  }

  const record: ReviewRecord = {
    id: crypto.randomUUID(),
    name: result.value.name,
    rating: result.value.rating,
    text: result.value.text,
    status: 'pending',
    token: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  await env.REVIEWS.put(`review:${record.id}`, JSON.stringify(record));

  // The review is safely stored either way; if this fails the owner just
  // won't get pinged and has to notice it later some other way.
  try {
    await sendTelegramReviewNotice(env, record);
  } catch (err) {
    console.error('[review] Telegram request failed', err instanceof Error ? err.message : err);
  }

  return json({ ok: true });
}

async function moderateReview(
  request: Request,
  env: Env,
  nextStatus: 'approved' | 'rejected',
): Promise<Response> {
  const url = new URL(request.url);
  const id = url.searchParams.get('id') ?? '';
  const token = url.searchParams.get('token') ?? '';

  if (!id || !token) return htmlResponse(confirmPage('Missing link parameters.'), 400);
  if (!env.REVIEWS) return htmlResponse(confirmPage('Storage is not configured.'), 500);

  const raw = await env.REVIEWS.get(`review:${id}`);
  if (!raw) {
    return htmlResponse(confirmPage('Review not found — it may have already been deleted.'), 404);
  }

  const record = JSON.parse(raw) as ReviewRecord;
  if (record.token !== token) {
    return htmlResponse(confirmPage('Invalid or expired link.'), 403);
  }

  if (record.status !== 'pending') {
    return htmlResponse(
      confirmPage(
        `Already ${record.status === 'approved' ? 'approved ✅' : 'rejected ❌'} — no action taken.`,
      ),
    );
  }

  record.status = nextStatus;
  await env.REVIEWS.put(`review:${id}`, JSON.stringify(record));

  return htmlResponse(
    confirmPage(
      nextStatus === 'approved'
        ? `Review by ${record.name} approved ✅ — now live on the site.`
        : `Review by ${record.name} rejected ❌ — it will not appear on the site.`,
    ),
  );
}

/** GET /api/review/approve?id=&token= — tapped from the Telegram message. */
export function handleReviewApprove(request: Request, env: Env): Promise<Response> {
  return moderateReview(request, env, 'approved');
}

/** GET /api/review/reject?id=&token= — tapped from the Telegram message. */
export function handleReviewReject(request: Request, env: Env): Promise<Response> {
  return moderateReview(request, env, 'rejected');
}

/** GET /api/reviews — public, approved reviews only, newest first. */
export async function handleReviewsList(env: Env): Promise<Response> {
  if (!env.REVIEWS) return json({ reviews: [], average: 0, count: 0 });

  const reviews: PublicReview[] = [];
  let cursor: string | undefined;
  do {
    const page = await env.REVIEWS.list({ prefix: 'review:', cursor });
    const values = await Promise.all(page.keys.map((k) => env.REVIEWS.get(k.name)));
    for (const raw of values) {
      if (!raw) continue;
      const record = JSON.parse(raw) as ReviewRecord;
      if (record.status === 'approved') {
        reviews.push({
          name: record.name,
          rating: record.rating,
          text: record.text,
          createdAt: record.createdAt,
        });
      }
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  reviews.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const count = reviews.length;
  const average = count ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

  return json({ reviews, average: Math.round(average * 10) / 10, count });
}
