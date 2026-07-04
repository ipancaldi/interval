import fs from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Pages toggled hidden in the CMS (visible: false in their frontmatter) are
// dropped from the sitemap. Read the flag straight from the markdown so the
// sitemap filter (which only sees URLs) knows which paths to exclude.
const HIDEABLE_PAGES = {
  approach: '/approach/',
  services: '/services/',
  about: '/about/',
  journal: '/journal/',
  contact: '/contact/',
};
const hiddenPaths = new Set(
  Object.entries(HIDEABLE_PAGES)
    .filter(([slug]) => {
      try {
        return /(^|\n)visible:\s*false\b/.test(
          fs.readFileSync(`src/content/pages/${slug}.md`, 'utf8'),
        );
      } catch {
        return false;
      }
    })
    .map(([, path]) => path),
);

// https://astro.build/config
//
// Static-first today. We keep `output: 'static'` so deploys are flat HTML
// to Cloudflare Pages / any static host. When DB-backed pages (forms,
// gated content, dashboards) become real, switch to `output: 'hybrid'`
// and add an adapter (`@astrojs/cloudflare`, `@astrojs/node`, etc.).
//
// Trailing slashes are forced for predictable Cloudflare Pages routing.
//
// `site` and `base` accept env overrides so the same source builds for:
//   - production custom domain at root (defaults below; the deploy
//     workflow sets SITE_URL=https://intervaladvisory.co.uk, BASE_PATH=/)
//   - a project sub-path, e.g. GitHub Pages at /interval/
//     (SITE_URL=https://ipancaldi.github.io, BASE_PATH=/interval/)
const SITE_URL  = process.env.SITE_URL  ?? 'https://intervaladvisory.co.uk';
const BASE_PATH = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  output: 'static',
  trailingSlash: 'always',
  // Generates /sitemap-index.xml (+ sitemap-0.xml) for search engines.
  // All routes are public now (About + Journal launched with v2.3).
  integrations: [
    sitemap({
      // Exclude hidden pages and everything beneath them (e.g. hiding
      // /journal/ also drops its articles /journal/<slug>/).
      filter: (page) => {
        const path = new URL(page).pathname;
        for (const hidden of hiddenPaths) {
          if (path.startsWith(hidden)) return false;
        }
        return true;
      },
    }),
  ],
  build: {
    format: 'directory',
  },
  vite: {
    resolve: {
      alias: {
        '@components': '/src/components',
        '@layouts': '/src/layouts',
        '@lib': '/src/lib',
        '@styles': '/src/styles',
        '@scripts': '/src/scripts',
        '@content': '/src/content',
        '@typings': '/src/types',
      },
    },
  },
});
