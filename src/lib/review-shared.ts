/**
 * Validation shared by the review form and /api/review.
 * Mirrors order-shared.ts's split: the client copy is for fast feedback,
 * the server re-runs all of it.
 */

export const REVIEW_LIMITS = {
  name: 60,
  text: 600,
} as const;

/** Same star glyph everywhere a rating renders — summary widget, reviews list, and the rating picker. */
export const STAR_PATH =
  'M12 2.5l2.99 6.06 6.69.97-4.84 4.72 1.14 6.65L12 17.77l-5.98 3.13 1.14-6.65-4.84-4.72 6.69-.97L12 2.5z';

export interface ReviewValue {
  name: string;
  rating: number;
  text: string;
}

export type ReviewValidationResult =
  | { ok: true; value: ReviewValue }
  | { ok: false; error: string };

export function validateReview(raw: unknown): ReviewValidationResult {
  if (!raw || typeof raw !== 'object') return { ok: false, error: 'invalid body' };
  const b = raw as Record<string, unknown>;

  const name = String(b.name ?? '').trim();
  if (!name) return { ok: false, error: 'name required' };
  if (name.length > REVIEW_LIMITS.name) return { ok: false, error: 'name too long' };

  const rating = Number(b.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: 'invalid rating' };
  }

  const text = String(b.text ?? '').trim();
  if (!text) return { ok: false, error: 'review text required' };
  if (text.length > REVIEW_LIMITS.text) return { ok: false, error: 'review text too long' };

  return { ok: true, value: { name, rating, text } };
}
