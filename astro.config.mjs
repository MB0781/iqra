// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Site publié sur GitHub Pages : https://mb0781.github.io/iqra/
export default defineConfig({
  site: 'https://mb0781.github.io',
  base: '/iqra',
  trailingSlash: 'always',
  integrations: [
    react(),
    sitemap({ filter: (page) => !page.includes('/studio') && !page.includes('/design') }),
  ],
  vite: { plugins: [tailwindcss()] },
  build: { inlineStylesheets: 'always' },
});
