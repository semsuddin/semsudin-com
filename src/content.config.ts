import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/caseStudies' }),
  schema: z.object({
    client: z.string(),
    role: z.string(),
    period: z.string(),
    industry: z.string(),
    summary: z.string(),
    metrics: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
    stack: z.array(z.string()),
    order: z.number().default(0),
    featured: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    readingTime: z.string().optional(),
  }),
});

export const collections = { caseStudies, blog };
