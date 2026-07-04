/**
 * markdown.ts — Markdown adapter
 *
 * Reads content from Astro's `astro:content` collections defined in
 * src/content/config.ts. Pages call methods on this module via the
 * abstract ContentAdapter in src/lib/content.ts, never directly.
 *
 * To swap to a DB:
 *   1. Create src/lib/adapters/db.ts exporting `dbAdapter` with the
 *      same shape.
 *   2. In src/lib/content.ts, change `const adapter = markdownAdapter`
 *      to `const adapter = dbAdapter`.
 *   No pages need to change.
 */

import { getCollection, getEntry } from "astro:content";
import type { ContentAdapter } from "@lib/content";
import type {
  PageSlug,
  PageContent,
  SiteSettings,
  ServiceItem,
  JournalEntry,
} from "@typings/content";

async function loadSite(): Promise<SiteSettings> {
  const entry = await getEntry("shared", "site");
  if (!entry) {
    throw new Error("Missing src/content/shared/site.json — required site settings.");
  }
  return entry.data as SiteSettings;
}

async function loadPage(slug: PageSlug): Promise<PageContent> {
  const entry = await getEntry("pages", slug);
  if (!entry) {
    throw new Error(`Missing src/content/pages/${slug}.md — page content not found.`);
  }
  // The `data` block in frontmatter carries the page's structured
  // content. We surface the raw markdown body too in case a page
  // wants to render long-form copy — pages can `await render(entry)`
  // directly via astro:content if they need the Astro Content
  // component for that.
  return {
    slug: entry.id as PageSlug,
    meta: entry.data.meta,
    body: entry.body ?? "",
    data: (entry.data.data ?? {}) as Record<string, unknown>,
  };
}

async function loadAllPages(): Promise<PageContent[]> {
  const entries = await getCollection("pages");
  return entries.map((entry) => ({
    slug: entry.id as PageSlug,
    meta: entry.data.meta,
    body: entry.body ?? "",
    data: (entry.data.data ?? {}) as Record<string, unknown>,
  }));
}

async function loadServices(): Promise<ServiceItem[]> {
  const entries = await getCollection("services");
  return entries
    .map((entry) => entry.data as ServiceItem)
    .sort((a, b) => {
      if (a.group !== b.group) return a.group === "pillar" ? -1 : 1;
      return a.order - b.order;
    });
}

async function loadJournal(): Promise<JournalEntry[]> {
  const entries = await getCollection("journal", ({ data }) => !data.draft);
  return entries
    .map((entry) => ({
      // entry.id keeps the .md extension on legacy content collections —
      // entry.slug is the clean, URL-safe identifier.
      slug: entry.slug,
      title: entry.data.title,
      category: entry.data.category,
      date: entry.data.date,
      summary: entry.data.summary,
      coverImage: entry.data.coverImage,
      coverImageAlt: entry.data.coverImageAlt,
      externalUrl: entry.data.externalUrl,
      draft: entry.data.draft,
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export const markdownAdapter: ContentAdapter = {
  getSite: loadSite,
  getPage: loadPage,
  listPages: loadAllPages,
  listServices: loadServices,
  listJournal: loadJournal,
};
