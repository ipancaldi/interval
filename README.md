# Interval — interval.studio

Editorial site for Interval, a strategic advisory and design lab.
**Astro 5** static site → **Cloudflare Pages** → **Sveltia CMS** at `/admin/`,
authenticated via a **Cloudflare Worker** OAuth proxy against GitHub.

---

## What's in this repo

```
src/
├─ pages/
│  ├─ index.astro                    Home (Hero → Approach → Framework → Pillars → Process → Selected Work → CTA)
│  ├─ about.astro                    /about/ — pulls from src/content/about/index.md
│  └─ case-studies/
│     ├─ index.astro                 /case-studies/ — gallery of all published studies
│     └─ [...slug].astro             /case-studies/<slug>/ — detail page per study
├─ components/                       Nav, Footer, Hero, FrameworkDiagram, Pillars, Phases, MetaRow, CaseStudyCard, TeamMember
├─ layouts/Base.astro                <head>, fonts, nav theme switch, reveal animation
├─ content/
│  ├─ config.ts                      Zod schemas for the two collections
│  ├─ about/index.md                 About page singleton (intro, team[], locations[], contact_email)
│  └─ case-studies/                  One markdown file per case study
└─ styles/global.css                 All the existing CSS tokens + new component styles

public/
├─ admin/
│  ├─ index.html                     Sveltia CMS loader
│  └─ config.yml                     Collection definitions (must match src/content/config.ts)
├─ assets/
│  ├─ fonts/                         Inter Variable WOFF (regular + italic)
│  ├─ images/                        Hero, photo bleed, photo grid imagery
│  ├─ uploads/                       Editor-uploaded media lands here (Sveltia)
│  └─ interval-logo-{black,white}.svg
└─ _headers                          Cloudflare Pages security + cache headers
```

---

## Local development

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # outputs static site to ./dist
npm run preview    # serve the built site
```

You need **Node 20+**.

---

## Content model

### Case Study (`src/content/case-studies/<slug>.md`)

| Field | Type | Notes |
|---|---|---|
| `title` | string | required |
| `client` | string | optional — empty renders as "Confidential" |
| `year` | number | required |
| `location` | string | optional, e.g. "London, UK" |
| `pillars` | string[] | from: Spatial · Technology · Brand & Digital · Content · Time |
| `phases` | string[] | from: Human Foundation · Vision · Master Planning · Realisation |
| `summary` | string | one-liner for index cards + meta description |
| `hero_image` | string | public path, e.g. `/assets/uploads/foo.jpg` |
| `hero_image_alt` | string | required |
| `gallery` | `{src, alt, caption?}[]` | optional |
| `featured` | boolean | shows on home page Selected Work strip if true |
| `order` | number | sort weight on index (lower = earlier) |
| `draft` | boolean | hide from production until ready |
| body | markdown | long-form case content |

### About (`src/content/about/index.md` — singleton)

| Field | Type | Notes |
|---|---|---|
| `intro` | string | short intro shown above the team |
| `team` | TeamMember[] | each: `name, role, photo?, photo_alt?, bio, links?` |
| `locations` | string[] | shown in footer; defaults to London, New York, Singapore |
| `contact_email` | string | defaults to `hello@interval.studio` |
| body | markdown | optional long-form below team |

---

## CMS setup (one-time)

Sveltia CMS runs entirely in the browser and reads/writes content directly to GitHub.
It needs an OAuth proxy to authenticate against GitHub — Cloudflare Workers hosts it for free.

### 1. Deploy the OAuth proxy

```bash
git clone https://github.com/sveltia/sveltia-cms-auth
cd sveltia-cms-auth
npm install
npx wrangler deploy
```

Wrangler will print the deployed URL, something like `https://sveltia-cms-auth.<subdomain>.workers.dev`. Keep it.

### 2. Create the GitHub OAuth app

Go to <https://github.com/settings/developers> → **New OAuth App**.

| Field | Value |
|---|---|
| Application name | Interval CMS (or anything) |
| Homepage URL | `https://interval.studio` |
| Authorization callback URL | `https://sveltia-cms-auth.<subdomain>.workers.dev/callback` |

After creating, copy the **Client ID** and **generate a Client Secret**.

### 3. Configure the Worker

In the Cloudflare dashboard → **Workers & Pages → sveltia-cms-auth → Settings → Variables**, add:

| Variable | Value |
|---|---|
| `GITHUB_CLIENT_ID` | (from step 2) |
| `GITHUB_CLIENT_SECRET` | (from step 2 — set as **Encrypted**) |
| `ALLOWED_DOMAINS` | `interval.studio,*.pages.dev` |

Save, redeploy.

### 4. Point Sveltia at the proxy

Edit `public/admin/config.yml` — line 11:

```yaml
backend:
  name: github
  repo: ipancaldi/interval-website
  branch: main
  base_url: https://sveltia-cms-auth.<subdomain>.workers.dev   # ← put your worker URL here
```

Commit and push. Once `interval.studio/admin/` deploys, you can visit it, click **Login**, authorise GitHub, and start editing.

---

## Cloudflare Pages deploy

In Cloudflare dashboard → **Workers & Pages → Create**:

- Choose the **Pages** flow (not Workers — telltale: it asks for build command + output directory, not `wrangler deploy`).
- **Connect to Git** → select `ipancaldi/interval-website`.
- **Production branch:** `main` (or whichever branch you've merged this scaffold into).
- **Framework preset:** Astro.
- **Build command:** `npm run build`.
- **Build output directory:** `dist`.
- **Root directory:** *blank.*
- **Save and Deploy.**

First build takes ~1 minute. Resulting URL: `https://interval-website.pages.dev`.

### Custom domain

In the project → **Custom domains → Set up a domain → interval.studio**.
Easiest: delegate the domain to Cloudflare nameservers; HTTPS provisions automatically.

### Verify after deploy

```bash
curl -sI https://interval.studio/ | grep -iE 'x-frame|x-content|referrer|permissions|cache-control'
curl -sI https://interval.studio/.git/HEAD                                    # expect 404
curl -sI https://interval.studio/.wrangler/cache/wrangler-account.json        # expect 404
```

---

## Editing without the CMS

If the CMS isn't set up yet (or you prefer a code editor):

- **Add a case study:** create `src/content/case-studies/<slug>.md`, follow the schema. Commit, push, Pages rebuilds.
- **Edit About:** edit `src/content/about/index.md`. Add team members under the `team:` list.
- **Add an image:** drop into `public/assets/uploads/` and reference as `/assets/uploads/<filename>`.

---

## Notes on the move from v1

- The previous single-file `index.html` has been broken into Astro components under `src/components/`.
- All the original CSS lives in `src/styles/global.css` — same tokens, same class names.
- Navigation now includes **Work** (`/case-studies/`) and **About** (`/about/`).
- The home page "Selected fields" gallery has been replaced with a **Selected Work** strip
  pulling featured case studies from the CMS. Once you've added 3+ featured case studies,
  the home page reflects them automatically.
- `_headers` carries forward security and cache headers from the old `netlify.toml`.

---

## Audit follow-ups still outstanding

These are tracked from the pre-migration audit; some are now resolved:

- [x] `<noscript>` override for `.reveal` elements (now in Base layout).
- [x] Skip-to-content link (now in Base layout).
- [x] Canonical URL (set per-page from `Astro.url`).
- [x] Twitter card meta (set per-page in Base).
- [ ] **OG image** — set `ogImage` prop on Base for each page; case study pages use the hero by default. Home/About need a designed 1200×630 image at `public/assets/og.jpg`.
- [ ] **WOFF2 fonts** — add `Inter.woff2` and `Inter-Italic.woff2` alongside the existing WOFF, list them first in the `@font-face` `src` declarations.
- [ ] **Hero PNG** — `sculpture-portal.png` is eager-loaded above the fold. Consider an optimised JPG/WebP via Astro's `<Image>` component.
