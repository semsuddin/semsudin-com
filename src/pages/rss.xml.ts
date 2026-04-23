import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return rss({
    title: 'Semsudin Sefić — Field Notes',
    description: 'Essays on shipping enterprise GenAI, AI-driven QA, RAG architecture, and production AI systems.',
    site: context.site!,
    items: posts
      .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf())
      .map((p) => ({
        title: p.data.title,
        description: p.data.description,
        pubDate: p.data.publishedAt,
        link: `/blog/${p.id}/`,
        categories: p.data.tags,
      })),
    customData: '<language>en-us</language>',
  });
}
