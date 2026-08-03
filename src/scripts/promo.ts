/**
 * Drives the offer countdowns and retires an offer the moment it ends.
 *
 * The price a customer is charged never depends on this code — `price_iqd` is
 * the charged price whether an offer is running or not. All this does is stop
 * showing an offer that is over, which also covers the case of a page that was
 * cached or left open past the end time.
 */

const pad = (n: number) => String(n).padStart(2, '0');

/** Hides every part of a finished offer for one product. */
function retire(slug: string | null): void {
  const scope: ParentNode = slug
    ? (document.querySelector(`[data-promo-scope="${slug}"]`) ?? document)
    : document;
  scope.querySelectorAll<HTMLElement>('[data-promo-part]').forEach((el) => {
    el.hidden = true;
  });
}

export function initCountdowns(): void {
  const clocks = Array.from(document.querySelectorAll<HTMLElement>('[data-countdown]'));
  if (!clocks.length) return;

  const tick = () => {
    const now = Date.now();
    let live = 0;

    for (const clock of clocks) {
      const target = Date.parse(clock.dataset.countdown ?? '');
      if (!Number.isFinite(target)) {
        retire(clock.closest<HTMLElement>('[data-promo-scope]')?.dataset.promoScope ?? null);
        continue;
      }

      let remaining = target - now;
      if (remaining <= 0) {
        // The offer is over: take the whole thing down rather than sit at zero.
        retire(clock.closest<HTMLElement>('[data-promo-scope]')?.dataset.promoScope ?? null);
        continue;
      }

      live++;
      const secs = Math.floor(remaining / 1000);
      const parts = {
        d: Math.floor(secs / 86400),
        h: Math.floor((secs % 86400) / 3600),
        m: Math.floor((secs % 3600) / 60),
        s: secs % 60,
      };
      for (const [key, value] of Object.entries(parts)) {
        const cell = clock.querySelector<HTMLElement>(`[data-cd="${key}"]`);
        if (cell) cell.textContent = pad(value);
      }
    }

    if (!live) window.clearInterval(handle);
  };

  const handle = window.setInterval(tick, 1000);
  tick();

  // A phone that was asleep can be minutes or hours out of date.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tick();
  });
}
