---
type: audit
domain: ventures
status: active
tags:
  - interval
  - website
  - audit
  - pre-deploy
created: 2026-05-05
updated: 2026-05-05
---

# Site Audit — 2026-05-05

> [!info] Pre-deploy audit of the Interval editorial site. Vault path: `Projects/Claude - Interval/Website/`. See [[Interval — Project Hub]].

## Stack

- Single-file `index.html` (~1300 lines): HTML + embedded CSS + vanilla JS.
- Inter Variable, self-hosted as WOFF (regular + italic), preloaded with `font-display: swap`.
- Inline SVG framework diagram and five inline SVG pillar visuals — no external graphics libraries.
- Inline data-URL favicon (no extra file request).
- Vanilla JS, IIFE, ES5-compatible: scroll-driven nav theme switch + `IntersectionObserver` reveal animations.
- Target host: Netlify (`netlify.toml` present); works on any static host.

## Asset inventory

All assets referenced in `index.html` are present in `assets/`:

- `assets/fonts/Inter.woff`, `assets/fonts/Inter-Italic.woff`
- `assets/interval-logo-black.svg`, `assets/interval-logo-white.svg`
- `assets/images/sculpture-portal.png` (hero, eager-loaded)
- `assets/images/amphitheater.jpg`, `coastal-architecture.jpg`, `architectural-model.jpg`, `curved-monument.jpg`, `cylinder-forms.jpg`

No orphan assets. No missing references.

## Design tokens — code matches README

CSS custom properties in `:root` align with the README palette: Black, Off-White, Beige, Mint, Electric, Brick, Mauve. Plus useful additions not in README: `--brick-tint-hover #E8CAAE`, `--light-grey #CBCBCB`, `--dark-grey #606060`.

Layout tokens: `--gutter`, `--col-gap`, `--section-pad` use `clamp()` for fluid scaling. `--radius: 4px`. Border tokens via `rgba(0,0,0,.14)` (light) / `rgba(255,255,255,.18)` (dark).

## Strengths

- **Clean, semantic markup.** `<header>`, `<main>`, `<section>`, `<figure>`/`<figcaption>`, `<article>` for pillars. Single `<h1>` with sensible heading hierarchy.
- **All images carry alt text.** Captions are decorative `<figcaption>`.
- **Reduced-motion support.** All transitions and reveal animations disabled under `prefers-reduced-motion: reduce`.
- **IntersectionObserver fallback.** If unsupported, all `.reveal` elements get `is-in` immediately.
- **Inter Variable correctly declared.** `font-weight: 100 900` range; regular/italic axis split; `font-optical-sizing: auto`; `font-feature-settings: "ss01", "cv11"`.
- **Netlify config sets sensible security headers** — `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, strict Referrer-Policy, restrictive Permissions-Policy.
- **Caching is tuned** — long-immutable on `/assets/*`, no-cache on `/index.html`.
- **Nav theme switch logic** correctly respects both hero and CTA dark blocks.

## Issues / fixes recommended

### High value, low effort

- [ ] **Add `<noscript>` style override.** `.reveal { opacity: 0 }` means JS-disabled visitors see blank sections. Add inside `<head>`:

  ```html
  <noscript><style>.reveal{opacity:1;transform:none}</style></noscript>
  ```

- [ ] **OG image missing.** `og:title` and `og:description` are set but no `og:image`. Social link previews will be blank. Add a 1200×630 image at `assets/images/og.jpg` and reference it.
- [ ] **No Twitter card meta.** Add `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`.
- [ ] **No canonical URL.** Add `<link rel="canonical" href="https://…">` once the domain is final.
- [ ] **No skip-link.** Add a focusable skip-to-content link as the first focusable element for keyboard users.

### Performance

- [ ] **Serve Inter as WOFF2 too.** WOFF2 is ~30 % smaller and universally supported. Add `Inter.woff2` / `Inter-Italic.woff2`, list them first in `@font-face src` (browsers pick the first they support), and update the two `<link rel="preload">` lines to point at `.woff2`.
- [ ] **Hero PNG.** `sculpture-portal.png` is above the fold and eager-loaded. PNG is heavier than necessary for a photographic image. Convert to optimised JPG or WebP — or both via `<picture>`.
- [ ] **Consider AVIF/WebP `<picture>` sources** for the bleed/grid JPGs. Netlify Image CDN can do this automatically if enabled.

### SEO / discoverability

- [ ] **No `robots.txt`, no `sitemap.xml`.** Trivial for a single-page site, but worth a one-line `robots.txt` allowing all once live.
- [ ] **No JSON-LD structured data.** An `Organization` schema with `name`, `url`, `address[]`, `email`, `logo` would help.
- [ ] **No analytics.** Either intentional or a gap — confirm.

### Content / copy verification

- [ ] **`hello@interval.studio`** — confirm domain ownership and mailbox routing. CTA points here.
- [ ] **"London · New York · Singapore"** — confirm all three locations are defensible at launch.
- [ ] **"Est. 2026"** + "© 2026 Interval Studio" — current year ✓.
- [ ] **Stat placeholders.** "90 % of life now spent indoors", "1.5× higher dwell time" — sources/footnotes? Consider linking to a methods page later.

### Optional polish

- [ ] **CSP header.** `netlify.toml` lacks `Content-Security-Policy`. Tricky with inline styles/scripts, but doable with `'unsafe-inline'` for now, or with hashes/nonces if hardened later.
- [ ] **Asset cache busting.** `/assets/*` is `immutable, max-age=1y` but filenames have no content hash. If an image is updated under the same name, returning visitors will see the cached version for up to a year. Either rename on update or shorten the cache window.
- [ ] **Logo height in nav (22 px)** — fine; double-check optical alignment with the Interval lockup at retina.
- [ ] **`onboarding.html`** sits one level up at `Projects/Claude - Interval/onboarding.html`. Confirm whether it's part of the deploy or scratch.

## Pre-deploy checklist

- [ ] WOFF2 fonts added and preloaded.
- [ ] `og:image` + Twitter card image at `assets/images/og.jpg`.
- [ ] Canonical URL set.
- [ ] Skip-link added.
- [ ] `<noscript>` style override added.
- [ ] `robots.txt` (allow all).
- [ ] Confirm `interval.studio` DNS + email.
- [ ] Choose deploy mode: drag-and-drop vs Git-connected (recommended).
- [ ] First Netlify deploy → confirm headers via `curl -I`.
- [ ] Run Lighthouse → target ≥ 95 across the board.

## Site location

**Canonical path** (set 2026-05-05): `Projects/Claude - Interval/Website/` — in-vault, Google Drive synced. This is the source of truth.

Full system path:

`/Users/igorpancaldi/Library/CloudStorage/GoogleDrive-igor.pancaldi@disguise.one/My Drive/Claude_Vault/Projects/Claude - Interval/Website`

Any other copy on disk (e.g. `~/Documents/Interval/Website`) is **not authoritative**. All edits, deploys, and audits target the path above.
