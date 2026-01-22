import { ObjectId } from "mongodb";
import { z } from "zod";

export const toolSchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: z.string(),
  short_description: z.string(),
  long_description: z.string(),
  image: z.url().nullable(),
  cover_image: z.url().nullable(),
  official_url: z.url(),
  external_urls: z.array(z.object({ type: z.string(), url: z.url() })),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
  owner: z.string().nullable(),
  released_at: z.iso.datetime().nullable(),
  added_by: z.string(),
  added_at: z.iso.datetime(),
  updated_by: z.string().nullable(),
  updated_at: z.iso.datetime().nullable(),
  stats: z.object({
    upvotes: z.int().min(0),
    downvotes: z.int().min(0),
    comments: z.int().min(0),
  }),
  status: z.enum(["pending", "published", "flagged"]),
});

export const toolWithVectorEmbeddings = toolSchema.extend({
  vectorEmbeddings: z.array(z.number()),
});

export const toolWithObjectIds = toolWithVectorEmbeddings.extend({
  _id: z.instanceof(ObjectId).optional(),
  owner: z.instanceof(ObjectId).nullable(),
  added_by: z.instanceof(ObjectId),
  updated_by: z.instanceof(ObjectId).nullable(),
});

export type Tool = z.infer<typeof toolSchema>;
export type ToolWithVectorEmbeddings = z.infer<typeof toolWithVectorEmbeddings>;
export type ToolWithObjectIds = z.infer<typeof toolWithObjectIds>;
