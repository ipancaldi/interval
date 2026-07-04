/**
 * content.ts (types)
 *
 * The shapes pages can rely on, regardless of which adapter is active.
 * If you change anything here, the Zod schemas in src/content/config.ts
 * MUST be updated to match — they validate the markdown adapter's input.
 */

export type PageSlug = "home" | "approach" | "services" | "about" | "journal" | "contact";

export interface SiteSettings {
  name: string;
  tagline: string;
  locations: string[];
  contactEmail: string;
  established: string;
}

export interface PageMeta {
  title: string;
  description?: string;
  ogImage?: string;
}

export interface PageContent {
  slug: PageSlug;
  meta: PageMeta;
  /** Raw markdown body. Pages that want a rendered Content component
   *  can call `render(entry)` from astro:content directly. */
  body: string;
  /** Page-specific structured data — shape defined per-page. */
  data: Record<string, unknown>;
}

/**
 * One row on the Services page. Five pillars + four phases will live
 * here so we can author them as content rather than hard-code them.
 */
export interface ServiceItem {
  num: string;        // "P / 01"
  name: string;
  summary: string;
  description?: string;
  group: "pillar" | "phase";
  /** Order within the group, lower first. */
  order: number;
}

/**
 * One entry on the Journal page. Backs both the per-article pages
 * (/journal/[slug]) and the home-page teaser.
 */
export type JournalCategory =
  | "news"
  | "articles"
  | "interests"
  | "event-reports"
  | "research"
  | "projects";

export interface JournalEntry {
  slug: string;
  title: string;
  category: JournalCategory;
  date: Date;
  summary?: string;
  coverImage?: string;
  coverImageAlt?: string;
  externalUrl?: string;
  draft: boolean;
}
