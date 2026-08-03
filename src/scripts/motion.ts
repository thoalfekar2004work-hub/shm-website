/**
 * Site-wide motion.
 *
 * Two jobs: reveal elements as they scroll into view, and give the nav a
 * subtle elevation once the page has scrolled. Everything here is a no-op
 * when the visitor has asked for reduced motion — in that case content is
 * simply visible from the start.
 */

const reduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Reveals `[data-reveal]` elements once, as they enter the viewport.
 * `data-reveal-delay` (in ms) staggers items within a group.
 */
export function initReveal(): void {
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!targets.length) return;

  // No JS-driven motion for reduced-motion users, and no hidden content if
  // IntersectionObserver is missing.
  if (reduced() || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        const delay = Number(el.dataset.revealDelay ?? 0);
        if (delay) el.style.transitionDelay = `${delay}ms`;
        el.classList.add('is-revealed');
        io.unobserve(el);
      }
    },
    // Fire a little before the element is fully on screen so the motion has
    // finished by the time it is properly in view.
    { rootMargin: '0px 0px -12% 0px', threshold: 0.01 },
  );

  targets.forEach((el) => io.observe(el));
}

/** Adds `.scrolled` to the nav once the page moves off the top. */
export function initNavElevation(): void {
  const nav = document.querySelector<HTMLElement>('.nav');
  if (!nav) return;

  let ticking = false;
  const update = () => {
    nav.classList.toggle('scrolled', window.scrollY > 8);
    ticking = false;
  };
  update();
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );
}

/** Pulses the cart badge whenever its count changes. */
export function initCartPulse(): void {
  if (reduced()) return;
  document.addEventListener('shm:cartchange', () => {
    document.querySelectorAll<HTMLElement>('[data-cart-count]').forEach((el) => {
      if (el.hidden) return;
      el.classList.remove('pulse');
      void el.offsetWidth; // restart the animation
      el.classList.add('pulse');
    });
  });
}

export function initMotion(): void {
  initReveal();
  initNavElevation();
  initCartPulse();
}
