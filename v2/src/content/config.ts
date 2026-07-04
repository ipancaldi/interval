/**
 * Content collection schemas (Astro Content).
 *
 * These Zod schemas validate the markdown frontmatter for every entry.
 * They must stay in lockstep with the TS types in src/types/content.ts —
 * any drift will surface as a build error.
 */

import { defineCollection, z } from "astro:content";

const pageMeta = z.object({
  title: z.string(),
  description: z.string().optional(),
  ogImage: z.string().optional(),
});

// The page's slug is derived from the filename (entry.id), not from
// frontmatter — `slug` is reserved by Astro 5 and gets stripped before
// the schema validator sees it.
const pages = defineCollection({
  type: "content",
  schema: z.object({
    meta: pageMeta,
    /** Free-form structured data, validated per-page in the page itself. */
    data: z.record(z.string(), z.unknown()).default({}),
  }),
});

const services = defineCollection({
  type: "data",
  schema: z.object({
    num: z.string(),
    name: z.string(),
    summary: z.string(),
    description: z.string().optional(),
    group: z.enum(["pillar", "phase"]),
    order: z.number().default(0),
  }),
});

const shared = defineCollection({
  type: "data",
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    locations: z.array(z.string()),
    contactEmail: z.string().email(),
    established: z.string(),
  }),
});

// Journal — one markdown file per entry (article, news item, event
// report, etc.). The body is the long-form content. The category
// drives filtering on /journal/.
const journal = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    category: z.enum([
      "news",
      "articles",
      "interests",
      "event-reports",
      "research",
      "projects",
    ]),
    date: z.coerce.date(),
    summary: z.string().optional(),
    coverImage: z.string().optional(),
    coverImageAlt: z.string().optional(),
    externalUrl: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { pages, services, shared, journal };
