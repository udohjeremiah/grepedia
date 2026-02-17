import { z } from "zod";

export const toolSchema = z.object({
  _id: z.string(),
  added_at: z.iso.datetime(),
  added_by: z.string(),
  categories: z.array(z.string()).max(4),
  external_urls: z
    .array(z.object({ type: z.string(), url: z.url() }))
    .max(4)
    .optional(),
  image: z.url().optional(),
  long_description: z.string(),
  name: z.string(),
  official_url: z.url(),
  owner: z.string().optional(),
  released_at: z.iso.datetime().optional(),
  short_description: z.string(),
  slug: z.string(),
  stats: z.object({
    comments: z.int().min(0),
    downvotes: z.int().min(0),
    upvotes: z.int().min(0),
  }),
  status: z.enum(["pending", "published", "flagged"]),
  tags: z.array(z.string()).max(8),
  updated_at: z.iso.datetime().optional(),
  updated_by: z.string().optional(),
});

export type Tool = z.infer<typeof toolSchema>;
