// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Tailwind 4 is wired through PostCSS (postcss.config.mjs) because the
// @tailwindcss/vite plugin is not yet compatible with Astro 6's rolldown-vite.
// https://astro.build/config
export default defineConfig({
  site: 'https://estuar.rs',
  i18n: {
    defaultLocale: 'sr',
    locales: ['sr', 'en', 'ru'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [sitemap()],
});
