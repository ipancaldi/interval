# Interval — v2

The new iteration of **intervaladvisory.co.uk**. Editorial site built around the
*Total Experience Design™* framework.

- **Stack:** Astro 5 · TypeScript (strict) · static-first, hybrid-ready
- **Hosting (intended):** Cloudflare Pages
- **Content:** Markdown collections behind a content-adapter seam,
  ready to swap to a DB or headless CMS without page changes

---

## Quick start

```bash
cd v2
nvm use          # respects .nvmrc → Node 20
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm run preview  # serve the built site
npm run check    # astro check (type + content schema validation)
```

---

## Folder map

```
v2/
├── astro.config.mjs        # static-first, trailing slashes, path aliases
├── tsconfig.json           # strict TS + path aliases
├── package.json
├── .nvmrc                  # Node 20
├── public/
│   ├── _headers            # Cloudflare Pages: security + cache headers
│   ├── favicon.svg
│   └── assets/
│       ├── fonts/          # Inter (regular + italic) WOFF
│       ├── images/         # editorial imagery
│       ├── logos/          # brand logos (black + white)
│       ├── icons/          # (empty) glyphs / spot illustrations
│       └── uploads/        # (empty) CMS-uploaded media if/when we add one
└── src/
    ├── pages/              # one route per file — 4 today
    │   ├── index.astro         /  → Home
    │   ├── approach.astro      /approach/
    │   ├── services.astro      /services/
    │   └── contact.astro       /contact/
    ├── layouts/
    │   └── Base.astro          single HTML shell every page uses
    ├── components/
    │   ├── nav/                Nav + Footer
    │   ├── sections/           Editorial building blocks (Hero, Stats…)
    │   ├── diagrams/           Illustrative SVGs (FrameworkDiagram)
    │   └── ui/                 Primitives (Button)
    ├── content/                Astro content collections
    │   ├── config.ts               Zod schemas
    │   ├── pages/                  one markdown file per page
    │   ├── services/               one JSON file per pillar / phase
    │   └── shared/site.json        site-wide settings
    ├── lib/
    │   ├── content.ts              public API for reading content
    │   └── adapters/
    │       ├── markdown.ts         current adapter (Astro content)
    │       └── README.md           how to add a DB / CMS adapter
    ├── scripts/
    │   ├── main.ts                 entry, imported by Base layout
    │   ├── nav-theme.ts            dark/light nav based on section below
    │   └── reveal.ts               IntersectionObserver fade-ins
    ├── styles/
    │   ├── tokens.css              colour, type, spacing, motion tokens
    │   ├── reset.css
    │   ├── typography.css          @font-face + global type rules
    │   ├── utilities.css           .container, .reveal, .skip-link
    │   └── global.css              entry; imports the four above
    └── types/
        ├── content.ts              shapes used by the content adapter
        └── ui.ts                   shapes used by section components
```

### Path aliases

The following aliases work in both `.astro` and `.ts` files:

| Alias        | Maps to              |
|--------------|----------------------|
| `@components/*` | `src/components/*` |
| `@layouts/*`    | `src/layouts/*`    |
| `@lib/*`        | `src/lib/*`        |
| `@styles/*`     | `src/styles/*`     |
| `@scripts/*`    | `src/scripts/*`    |
| `@content/*`    | `src/content/*`    |
| `@typings/*`    | `src/types/*`      |

---

## Design system

### Tokens

All visual decisions live in [`src/styles/tokens.css`](./src/styles/tokens.css)
as CSS custom properties:

- **Palette:** `--c-black`, `--c-off-white` (warm paper, the canonical
  background), `--c-electric` (light-surface italic accent), `--c-mint`
  (dark-surface italic accent), `--c-brick-tint` (primary CTA),
  `--c-beige`, `--c-mauve`.
- **Type scale:** `--fs-meta`, `--fs-body`, `--fs-body-lg`, `--fs-h4`,
  `--fs-h3`, `--fs-h2`, `--fs-display`, `--fs-statement`.
- **Spacing:** `--gutter`, `--col-gap`, `--section-pad`.
- **Motion:** `--ease-out`, `--dur-fast`, `--dur-base`, `--dur-slow`.

To change the brand, edit tokens.css. Components read from these
variables — they don't hard-code colours or sizes.

### Italic emphasis

The brand's signature tic: italic phrases inside titles, coloured by
surface. Each component handles its own emphasis colour:

```html
<!-- on a light surface -->
<h2>A new approach to <em>experience design</em>.</h2>   <!-- mint -->
<!-- on a dark surface -->
<h1>Designed <em>end‑to‑end</em>.</h1>                    <!-- electric -->
```

`em` is global (Inter italic, weight 400). The colour is applied by
each section's scoped styles, based on which surface it sits on.

### Surface-aware nav

The nav reads `data-surface="dark|light"` from sections and styles
itself to match. To add a new section that should trigger a light nav,
add `data-surface="light"` to its root element. The script that does
this lives in [`src/scripts/nav-theme.ts`](./src/scripts/nav-theme.ts).

---

## Content workflow

### Edit page copy

Each of the four pages has a markdown file in `src/content/pages/`:

```
src/content/pages/
├── home.md
├── approach.md
├── services.md
└── contact.md
```

The frontmatter has two parts:

- `meta` → SEO (title, description, OG image)
- `data` → page-specific structured content (hero copy, CTA copy, etc.)

The page file in `src/pages/*.astro` reads its content via:

```ts
const page = await getPage("home");
const d = page.data as { /* page-specific shape */ };
```

To change copy, edit the markdown frontmatter — never the page file.

### Edit the Services list

Five pillars and four phases live as one JSON file each under
`src/content/services/`. Schema in `src/content/config.ts`. Order and
group control where they appear:

| Field | Notes |
|---|---|
| `num` | `"P / 01"` for pillars, `"PH / 01"` for phases |
| `name` | display name |
| `summary` | short description shown in the card / row |
| `group` | `"pillar"` or `"phase"` |
| `order` | sort order within the group |

The Services page reads these via `listServices()` and routes them to
the Pillars + Phases components.

### Site-wide settings

`src/content/shared/site.json` carries the studio name, tagline,
locations, contact email, and "established" line. Reachable via
`getSite()` anywhere.

---

## Architecture decisions

### Content adapter

Pages don't import from `astro:content`. They call `getPage`,
`getSite`, `listServices` from [`@lib/content`](./src/lib/content.ts).
Today that delegates to a markdown adapter; tomorrow it can delegate
to a database or headless CMS — *no page changes required*.

See [`src/lib/adapters/README.md`](./src/lib/adapters/README.md) for
the swap recipe.

### Static-first, hybrid-ready

The current `astro.config.mjs` has `output: 'static'`. When a feature
genuinely needs a server (form submission, gated content, dashboards),
flip to `output: 'hybrid'`, add the appropriate Astro adapter
(`@astrojs/cloudflare`, `@astrojs/node`), and mark the specific page
or endpoint with `export const prerender = false`. Static pages stay
static.

### Why CSS custom properties + scoped Astro styles

- **Tokens are global** — one place to change brand colours / type.
- **Component styles are scoped** — Astro's `<style>` blocks are
  scoped by default. No naming collisions, no BEM gymnastics, no
  utility-class soup.
- **No Tailwind / CSS-in-JS** by deliberate choice — the brand's
  editorial voice reads cleanly as plain CSS.

### Path aliases over relative imports

`@components/...` reads better than `../../../components/...`, and
moving files around doesn't break imports. Aliases are defined in
`astro.config.mjs` (vite) AND `tsconfig.json` (compiler) — keep them
in sync if you add new ones.

---

## Adding things

### Add a new page

1. Create `src/pages/<slug>.astro`.
2. (Optional) add `src/content/pages/<slug>.md` and a new value to the
   `slug` union in `src/types/content.ts` and the matching Zod enum
   in `src/content/config.ts`.
3. Add a link to the nav (currently hard-coded in
   `src/components/nav/Nav.astro` — promote to content if it grows
   beyond half a dozen entries).

### Add a new section component

Drop it into `src/components/sections/`. Conventions:

- Props are an explicit `interface Props { … }`.
- Long strings that may carry `<em>` accept HTML — use `set:html`
  carefully and document it in a comment.
- Styles are scoped in the component's own `<style>` block.
- Token references (`var(--c-...)`) only — no magic numbers.

### Add a new asset

- **Image** → `public/assets/images/<filename>`. Reference as
  `/assets/images/<filename>`.
- **Logo / icon** → `public/assets/logos/` or `public/assets/icons/`.
- **Font** → `public/assets/fonts/`. Add a `@font-face` block in
  `src/styles/typography.css` AND a `<link rel="preload">` in
  `Base.astro`.

---

## Deploy (Cloudflare Pages)

When promoting this to production:

| Setting | Value |
|---|---|
| Framework preset | Astro |
| Build command | `npm run build` |
| Output directory | `dist` |
| Root directory | `v2/` (until v2/ is promoted to repo root) |
| Production branch | `main` (or whatever ships) |
| Node version | `20` (set `NODE_VERSION=20` env var) |

`public/_headers` carries security + cache headers automatically.

### Verify after deploy

```bash
curl -sI https://<your-pages-url>/ | grep -iE 'x-frame|x-content|referrer|permissions|cache-control'
```

---

## Roadmap (deferred until needed)

- **Image optimisation** — wire `astro:assets` `<Image>` for the
  editorial photography. WOFF2 fonts alongside WOFF.
- **OG image** — designed 1200×630 at `public/assets/og.jpg`.
- **Contact form** — once we move to hybrid, scaffold a `ContactForm`
  component and a `/api/contact` endpoint.
- **DB integration** — implement `src/lib/adapters/db.ts` and switch
  the adapter export in `src/lib/content.ts`.
- **Headless CMS (optional)** — point Sveltia (already used by v1) or
  any GitOps CMS at `src/content/` if non-developers need to author.

---

## Legacy

- [`../old_v1/`](../old_v1/) — the original single-file `index.html`
  reference site. The brand truth.
- [`../src/`](../src/) — the previous Astro 2.0.0 scaffold (Home,
  About, Case Studies, Sveltia at `/admin/`). Kept for reference until
  v2 is promoted; safe to delete then.
