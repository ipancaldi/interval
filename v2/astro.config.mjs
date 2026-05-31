import { defineConfig } from 'astro/config';

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
