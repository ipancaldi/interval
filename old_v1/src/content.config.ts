import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const PILLARS = [
  'Spatial',
  'Technology',
  'Brand & Digital',
  'Content',
  'Time',
] as const;

const PHASES = [
  'Human Foundation',
  'Vision',
  'Master Planning',
  'Realisation',
] as const;

const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/case-studies' }),
  schema: z.object({
    title: z.string(),
    client: z.string().default('Confidential'),
    year: z.number().int().min(1900).max(2100),
    location: z.string(),
    pillars: z.array(z.enum(PILLARS)).default([]),
    phases: z.array(z.enum(PHASES)).default([]),
    summary: z.string(),
    hero_image: z.string(),
    hero_image_alt: z.string(),
    gallery: z
      .array(
        z.object({
          src: z.string(),
          alt: z.string(),
          caption: z.string().optional(),
        })
      )
      .default([]),
    featured: z.boolean().default(false),
    order: z.number().int().default(0),
    draft: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    intro: z.string(),
    team: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
          bio: z.string().optional(),
          photo: z.string().optional(),
          photo_alt: z.string().optional(),
        })
      )
      .default([]),
    locations: z.array(z.string()).default(['London', 'New York', 'Singapore']),
    contact_email: z.string().email().default('hello@interval.studio'),
  }),
});

export const collections = {
  'case-studies': caseStudies,
  pages,
};
