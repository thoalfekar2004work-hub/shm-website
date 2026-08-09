/**
 * Production entry point.
 *
 * This Cloudflare project was created as a Workers-with-static-assets
 * project (its URL is a *.workers.dev domain, not *.pages.dev) — not the
 * classic git-connected Pages project the rest of this codebase was written
 * for. That matters because Workers-with-assets has no idea what a
 * `functions/` directory is; file-based Functions routing is a Pages-only
 * build step. Without this file, every request just falls through to static
 * assets and `/api/order` 404s.
 *
 * So: this is the one thing Cloudflare actually runs. It handles the one
 * dynamic route itself and hands everything else to the static-assets
 * binding configured in wrangler.toml. The real order logic lives in
 * functions/api/order.ts and is shared, not duplicated — that file also
 * still exports a classic `onRequest` for local `wrangler pages dev` testing
 * or in case this ever becomes a real Pages project later.
 */
import { handleOrderRequest, type Env as OrderEnv } from '../functions/api/order';
import {
  handleReviewSubmit,
  handleReviewApprove,
  handleReviewReject,
  handleReviewVerify,
  handleReviewsList,
  type Env as ReviewEnv,
} from '../functions/api/review';

interface Env extends OrderEnv, ReviewEnv {
  /** Static-assets binding, configured via [assets] in wrangler.toml. */
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    switch (url.pathname) {
      case '/api/order':
        return handleOrderRequest(request, env);
      case '/api/review':
        return handleReviewSubmit(request, env);
      case '/api/review/approve':
        return handleReviewApprove(request, env);
      case '/api/review/reject':
        return handleReviewReject(request, env);
      case '/api/review/verify':
        return handleReviewVerify(request, env);
      case '/api/reviews':
        return handleReviewsList(env);
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
