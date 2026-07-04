/**
 * content.ts
 *
 * The single source of truth pages should call when they need data.
 * Pages MUST NOT import directly from "astro:content" or any specific
 * adapter — they only import from here. That lets us swap the backing
 * store (markdown → DB → headless CMS) without touching any page.
 *
 * Usage:
 *   import { getPage, getSite } from "@lib/content";
 *   const page = await getPage("home");
 */

import type {
  PageSlug,
  PageContent,
  SiteSettings,
  ServiceItem,
  JournalEntry,
} from "@typings/content";
import { markdownAdapter } from "./adapters/markdown";

/**
 * The interface every adapter must satisfy. To swap in a DB or
 * headless CMS later, implement these methods against the new store
 * and re-export it from this module.
 */
export interface ContentAdapter {
  getSite(): Promise<SiteSettings>;
  getPage(slug: PageSlug): Promise<PageContent>;
  listPages(): Promise<PageContent[]>;
  listServices(): Promise<ServiceItem[]>;
  listJournal(): Promise<JournalEntry[]>;
}

/**
 * Active adapter. Today this is the markdown adapter. To switch:
 *
 *   import { dbAdapter } from "./adapters/db";
 *   const adapter: ContentAdapter = dbAdapter;
 */
const adapter: ContentAdapter = markdownAdapter;

export const getSite      = (): Promise<SiteSettings>     => adapter.getSite();
export const getPage      = (slug: PageSlug)              => adapter.getPage(slug);
export const listPages    = (): Promise<PageContent[]>    => adapter.listPages();
export const listServices = (): Promise<ServiceItem[]>    => adapter.listServices();
export const listJournal  = (): Promise<JournalEntry[]>   => adapter.listJournal();

export type { PageSlug, PageContent, SiteSettings, ServiceItem, JournalEntry };
