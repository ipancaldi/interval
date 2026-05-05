# Interval — Total Experience Design™

Editorial site for Interval, a strategic advisory and design lab.

**Stack**

- [Astro 5](https://astro.build) — static site generator with content collections
- [Sveltia CMS](https://github.com/sveltia/sveltia-cms) — Git-backed editor at `/admin/`
- [Cloudflare Pages](https://pages.cloudflare.com/) — hosting
- [`sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth) Cloudflare Worker — GitHub OAuth proxy

## Project structure

```
interval-website/
├── src/
│   ├── content/
│   │   ├── case-studies/        ← editable case studies (markdown)
│   │   └── pages/about.md       ← editable About page (markdown)
│   ├── pages/
│   │   ├── index.astro          ← homepage (the editorial single-page)
│   │   ├── about.astro          ← reads pages/about.md
│   │   └── work/
│   │       ├── index.astro      ← case studies index
│   │       └── [...slug].astro  ← case study detail
│   ├── layouts/Base.astro       ← <head>, nav, footer, scroll-driven theme switch
│   ├── styles/global.css        ← all design tokens + component styles
│   └── content.config.ts        ← collection schemas (Zod)
├── public/
│   ├── admin/                   ← Sveltia CMS (index.html + config.yml)
│   ├── assets/                  ← fonts, images, logos
│   ├── uploads/                 ← Sveltia uploads land here (gitignored if you prefer)
│   ├── _headers                 ← Cloudflare Pages security & cache headers
│   └── robots.txt
└── astro.config.mjs
```

## Local development

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # outputs to dist/
npm run preview      # serve dist/ locally
```

Node 20+ required (see `.nvmrc`).

## Editing content

**Through Sveltia CMS** (recommended):

1. Open `https://interval.studio/admin/` (or local `/admin/` after `npm run preview`).
2. Sign in with GitHub.
3. Edit Case Studies or About. On save, Sveltia commits to GitHub and Cloudflare Pages rebuilds.

**Directly in the repo:**

- Case studies: `src/content/case-studies/*.md` — frontmatter schema in `src/content.config.ts`.
- About page: `src/content/pages/about.md`.
- Image uploads: `public/uploads/<collection>/...` — referenced from markdown as `/uploads/<collection>/foo.jpg`.

## Deployment

### Cloudflare Pages

In the Cloudflare dashboard → Pages → Create a project → Connect to Git → select `ipancaldi/interval-website`.

| Setting | Value |
|---|---|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |
| Node version | `20` (set as env var `NODE_VERSION=20`) |

Every push to `main` triggers a rebuild.

### `sveltia-cms-auth` Worker (one-time)

The CMS needs a Worker to handle GitHub OAuth.

1. Fork [`sveltia/sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth) or use the one-click deploy button in its README.
2. Register a GitHub OAuth App (Settings → Developer settings → OAuth Apps):
   - **Homepage URL**: `https://interval.studio`
   - **Authorization callback URL**: `https://sveltia-cms-auth.<YOUR-SUBDOMAIN>.workers.dev/callback`
3. In the Worker dashboard → Settings → Variables, add:
   - `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` (from the OAuth App)
   - `ALLOWED_DOMAINS = interval.studio, *.pages.dev`
4. Update `public/admin/config.yml` → `backend.base_url` to the Worker's URL.

### Custom domain

Cloudflare Pages → your project → Custom domains → Add `interval.studio`. HTTPS is automatic.

## Adding a case study (without the CMS)

```bash
cp src/content/case-studies/coastal-pavilion.md src/content/case-studies/new-project.md
# edit frontmatter + body
git add . && git commit -m "Add new-project case study" && git push
```

## Notes

- `public/_headers` replaces the previous `netlify.toml`.
- Inter is self-hosted as both `.woff2` (preferred) and `.woff` (fallback) in `public/assets/fonts/`. Only `.woff` files migrated from the old project — drop the `.woff2` versions in for ~30 % smaller transfers.
- Hero image (`sculpture-portal.png`) is eager-loaded; consider serving as optimised JPG or WebP.
- `/admin/` is `noindex` via `_headers`.
