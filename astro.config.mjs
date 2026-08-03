import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static output, deployed to Cloudflare Pages. The checkout endpoint lives in
// functions/api/order.ts and is picked up by Pages automatically — it is not
// part of the Astro build.
export default defineConfig({
  site: 'https://shm-website.pages.dev',
  output: 'static',
  integrations: [
    sitemap({
      // Cart, checkout and the success page are noindex — keep them out of the
      // sitemap too, so the two signals agree.
      filter: (page) => !/\/(cart|checkout|order-received)\/?$/.test(page),
    }),
  ],
  build: { inlineStylesheets: 'auto' },
  image: {
    // The owner's photos are large PNGs; sharp downsizes them at build time.
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  vite: {
    build: { assetsInlineLimit: 1024 },
  },
});
