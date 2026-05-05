import { defineCollection, z } from 'astro:content';

const PILLARS = ['Spatial', 'Technology', 'Brand & Digital', 'Content', 'Time'] as const;
const PHASES = ['Human Foundation', 'Vision', 'Master Planning', 'Realisation'] as const;

const caseStudies = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    client: z.string().optional(),
    year: z.number(),
    location: z.string().optional(),
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
        }),
      )
      .default([]),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

const about = defineCollection({
  type: 'content',
  schema: z.object({
    intro: z.string(),
    team: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
          photo: z.string().optional(),
          photo_alt: z.string().optional(),
          bio: z.string(),
          links: z
            .array(
              z.object({
                label: z.string(),
                url: z.string(),
              }),
            )
            .default([]),
        }),
      )
      .default([]),
    locations: z.array(z.string()).default(['London', 'New York', 'Singapore']),
    contact_email: z.string().default('hello@interval.studio'),
  }),
});

export const collections = {
  'case-studies': caseStudies,
  about,
};
