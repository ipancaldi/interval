/**
 * asset.ts — prefix absolute /public paths with Astro's base URL.
 *
 * When the site is deployed at a subpath (e.g. GitHub Pages at
 * https://user.github.io/repo/), Astro sets `import.meta.env.BASE_URL`
 * to `/repo/`. We need to prefix any string we hand-write into `src`
 * / `href` / etc. with that base, since Astro does NOT auto-rewrite
 * arbitrary user strings.
 *
 *   asset('/assets/icons/foo.svg')  →  '/repo/assets/icons/foo.svg' (prod)
 *                                  →  '/assets/icons/foo.svg'     (dev / root)
 */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL ?? "/";
  const trimmedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const trimmedPath = path.startsWith("/") ? path : `/${path}`;
  return `${trimmedBase}${trimmedPath}`;
}
