/**
 * Language switching. English is the served default; the choice persists in
 * localStorage and is applied to <html lang dir> before paint by the inline
 * bootstrap in Layout.astro, so there is no flash.
 *
 * Three languages: English, Arabic, and Kurdish (Sorani). The nav's language
 * menu lets the customer pick one directly (see Nav.astro) rather than
 * cycling through them with repeated clicks.
 */
export type Lang = 'ar' | 'en' | 'ku';

export const LANGS: Lang[] = ['en', 'ar', 'ku'];

const KEY = 'shm.lang';
const RTL: Lang[] = ['ar', 'ku'];

function capitalize(lang: Lang): 'Ar' | 'En' | 'Ku' {
  return (lang.charAt(0).toUpperCase() + lang.slice(1)) as 'Ar' | 'En' | 'Ku';
}

export function getLang(): Lang {
  const el = document.documentElement.getAttribute('lang');
  return el === 'ar' || el === 'ku' ? el : 'en';
}

export function setLang(lang: Lang): void {
  const html = document.documentElement;
  html.setAttribute('lang', lang);
  html.setAttribute('dir', RTL.includes(lang) ? 'rtl' : 'ltr');
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
 * aria-label, title). Each element carries all three values as
 * data-*-ar/-en/-ku.
 */
const ATTRS = ['placeholder', 'aria-label', 'title', 'alt', 'content'] as const;

export function applyAttributes(lang: Lang): void {
  for (const attr of ATTRS) {
    const key = attr.replace('aria-', 'aria');
    const sel = `[data-${key}-ar],[data-${key}-en],[data-${key}-ku]`;
    document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
      const value = el.dataset[`${key}${capitalize(lang)}`];
      if (value != null) el.setAttribute(attr, value);
    });
  }
}

function applyMeta(lang: Lang): void {
  const title = document.querySelector<HTMLElement>(`[data-page-title-${lang}]`);
  const titleValue = title?.dataset[`pageTitle${capitalize(lang)}`];
  if (titleValue) document.title = titleValue;

  const desc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  const descValue = desc?.dataset[`desc${capitalize(lang)}`];
  if (desc && descValue) desc.setAttribute('content', descValue);
}

export function initLang(): void {
  applyAttributes(getLang());
}
