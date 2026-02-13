// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import remarkBreaks from 'remark-breaks';
import { remarkLinkCard } from './src/plugins/remark-link-card.mjs';

import expressiveCode from 'astro-expressive-code';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  markdown: {
    remarkPlugins: [remarkBreaks,remarkLinkCard]
  },

  image: {
    domains: ["img.hima.monukedayo.cc"]
  },

  integrations: [expressiveCode({
    styleOverrides: {
      codeFontFamily: "'Fira Code Variable',monospace",
      uiFontFamily: "'Inter','Inter Variable',sans-serif"
    }
  })]
});