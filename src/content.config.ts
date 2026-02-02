import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from 'astro/zod';

const blog = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./content/blog" }),
    schema: ({image}) => z.object({
        title: z.string(),
        description: z.string(),
        publishedAt: z.date(),
        thumbnail: image().optional()
    })
})

export const collections = { blog };