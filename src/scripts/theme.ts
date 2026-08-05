/**
 * Light/dark toggle. Defaults to the OS/browser preference on first visit;
 * an explicit choice persists in localStorage and is applied to
 * <html data-theme> before paint by the inline bootstrap in Layout.astro, so
 * there is no flash.
 */
export type Theme = 'light' | 'dark';

const KEY = 'shm.theme';

export function getTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

export function setTheme(theme: Theme): void {
  const html = document.documentElement;
  if (theme === 'dark') html.setAttribute('data-theme', 'dark');
  else html.removeAttribute('data-theme');
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* private mode — the toggle still works for this page view */
  }
  document.dispatchEvent(new CustomEvent('shm:themechange', { detail: { theme } }));
}

export function initThemeToggle(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setTheme(getTheme() === 'dark' ? 'light' : 'dark');
    });
  });
}
