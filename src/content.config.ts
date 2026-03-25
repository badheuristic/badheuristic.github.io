import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
    loader: glob({
        pattern: '**/*.{md,mdx}',
        base: './src/content/blog',
        generateId: ({ entry }: { entry: string }) => entry.replace(/\.mdx?$/, ''),
    }),
    schema: z.object({
        title: z.string(),
        date: z.date(),
        description: z.string(),
        tags: z.array(z.string()).optional(),
    }),
});

export const collections = { blog };
