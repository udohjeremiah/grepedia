import { z } from "zod";

import { objectIdSchema } from "../object-id.js";
import { slugSchema } from "../slug.js";

export const toolSchema = z.object({
  _id: objectIdSchema,
  addedAt: z.iso.datetime(),
  addedBy: objectIdSchema,
  categories: z.array(z.string()).min(1).max(4),
  externalUrls: z
    .array(z.object({ platform: z.string(), url: z.url() }))
    .max(4)
    .optional(),
  longDescription: z.string(),
  name: z.string(),
  officialUrl: z.url(),
  releasedAt: z.iso.datetime().optional(),
  shortDescription: z.string(),
  slug: slugSchema,
  stats: z.object({
    comments: z.int().min(0),
    downvotes: z.int().min(0),
    upvotes: z.int().min(0),
  }),
  status: z.enum(["pending", "published", "archived", "flagged"]),
  tags: z.array(z.string()).min(1).max(8),
  updatedAt: z.iso.datetime().optional(),
  updatedBy: objectIdSchema.optional(),
});

export type Tool = z.infer<typeof toolSchema>;
