import { z } from "zod";

export const toolSchema = z.object({
  _id: z.string(),
  added_at: z.iso.datetime(),
  added_by: z.string(),
  categories: z.array(z.string()),
  cover_image: z.url().nullable(),
  external_urls: z.array(z.object({ type: z.string(), url: z.url() })),
  image: z.url().nullable(),
  long_description: z.string(),
  name: z.string(),
  official_url: z.url(),
  owner: z.string().nullable(),
  released_at: z.iso.datetime().nullable(),
  short_description: z.string(),
  slug: z.string(),
  stats: z.object({
    comments: z.int().min(0),
    downvotes: z.int().min(0),
    upvotes: z.int().min(0),
  }),
  status: z.enum(["pending", "published", "flagged"]),
  tags: z.array(z.string()),
  updated_at: z.iso.datetime().nullable(),
  updated_by: z.string().nullable(),
});

export type Tool = z.infer<typeof toolSchema>;
