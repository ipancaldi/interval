# Content adapters

Pages never read content directly. They call `getPage`, `getSite`,
`listServices`, etc. from `@lib/content`, which delegates to whichever
**adapter** is plugged in.

Today the active adapter is `markdown.ts` — it reads from Astro's
`astro:content` collections backed by `src/content/`. To swap to a DB
or headless CMS, follow this pattern.

## How to add a DB adapter

1. **Install your driver.** For example, Postgres via `pg`, Drizzle,
   Prisma, or Astro DB.

2. **Create `src/lib/adapters/db.ts`** exporting an object that
   satisfies the `ContentAdapter` interface defined in
   `src/lib/content.ts`:

   ```ts
   import type { ContentAdapter } from "@lib/content";
   import { db } from "../db-client";

   export const dbAdapter: ContentAdapter = {
     async getSite()        { /* SELECT … */ },
     async getPage(slug)    { /* SELECT … WHERE slug = $1 */ },
     async listPages()      { /* SELECT * FROM pages */ },
     async listServices()   { /* SELECT * FROM services ORDER BY … */ },
   };
   ```

3. **Switch the active adapter** in `src/lib/content.ts`:

   ```diff
   - import { markdownAdapter } from "./adapters/markdown";
   - const adapter: ContentAdapter = markdownAdapter;
   + import { dbAdapter } from "./adapters/db";
   + const adapter: ContentAdapter = dbAdapter;
   ```

4. **Flip the build target.** In `astro.config.mjs`, change
   `output: 'static'` to `output: 'hybrid'` and add the appropriate
   Astro adapter (`@astrojs/cloudflare`, `@astrojs/node`, etc.) so
   pages that need a DB connection can be server-rendered.

5. **Migrate content.** The shape of every page's `data` object is
   page-defined (see `src/pages/*.astro`). A simple migration script
   can read the markdown frontmatter and insert rows.

No pages or components need to change. The adapter seam is the only
contract.

## Why this exists

- The site is **static-first today** — Cloudflare Pages, zero servers.
- We anticipate **forms, gated content, dashboards** later. When that
  arrives, only the adapter changes.
- Editing content via a **headless CMS** (Sanity, Contentful, Payload,
  Sveltia) is another flavour of the same swap.

If you find yourself reaching past `@lib/content` to read data
directly inside a page, stop — add the method to the interface and
implement it in the adapter instead.
