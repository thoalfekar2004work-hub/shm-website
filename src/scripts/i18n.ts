/**
 * Language toggle. English is the served default; the choice persists in
 * localStorage and is applied to <html lang dir> before paint by the inline
 * bootstrap in Layout.astro, so there is no flash.
 */
export type Lang = 'ar' | 'en';

const KEY = 'shm.lang';

export function getLang(): Lang {
  const el = document.documentElement.getAttribute('lang');
  return el === 'ar' ? 'ar' : 'en';
}

export function setLang(lang: Lang): void {
  const html = document.documentElement;
  html.setAttribute('lang', lang);
  html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    /* private mode — the toggle still works for this page view */
  }
  applyAttributes(lang);
  applyMeta(lang);
  document.dispatchEvent(new CustomEvent('shm:langchange', { detail: { lang } }));
}

/**
 * Strings that live in attributes rather than text nodes (placeholder, alt,
 * aria-label, title). Each element carries both values as data-*-ar/-en.
 */
const ATTRS = ['placeholder', 'aria-label', 'title', 'alt', 'content'] as const;

export function applyAttributes(lang: Lang): void {
  for (const attr of ATTRS) {
    const key = attr.replace('aria-', 'aria');
    const sel = `[data-${key}-ar],[data-${key}-en]`;
    document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
      const value = el.dataset[`${key}${lang === 'ar' ? 'Ar' : 'En'}`];
      if (value != null) el.setAttribute(attr, value);
    });
  }
}

function applyMeta(lang: Lang): void {
  const title = document.querySelector<HTMLElement>(`[data-page-title-${lang}]`);
  const t = title?.dataset[`pageTitle${lang === 'ar' ? 'Ar' : 'En'}`];
  if (t) document.title = t;

  const desc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  const d = desc?.dataset[`desc${lang === 'ar' ? 'Ar' : 'En'}`];
  if (desc && d) desc.setAttribute('content', d);
}

export function initLangToggle(): void {
  const lang = getLang();
  applyAttributes(lang);

  document.querySelectorAll<HTMLButtonElement>('[data-lang-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setLang(getLang() === 'ar' ? 'en' : 'ar');
    });
  });
}
