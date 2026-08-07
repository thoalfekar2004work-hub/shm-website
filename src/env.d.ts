/// <reference types="astro/client" />

interface Window {
  /** Google Tag Manager's event queue — see Layout.astro for the loader snippet. */
  dataLayer?: Record<string, unknown>[];
}
