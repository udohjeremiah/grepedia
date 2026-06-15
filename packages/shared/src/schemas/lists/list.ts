import { z } from "zod";

import { objectIdSchema } from "@/schemas/object-id.js";
import { slugSchema } from "@/schemas/slug.js";

export const listSchema = z.object({
  _id: objectIdSchema,
  archivedAt: z.iso.datetime().optional(),
  createdAt: z.iso.datetime(),
  createdBy: objectIdSchema,
  description: z.string(),
  isOfficial: z.boolean().optional(),
  publishedAt: z.iso.datetime().optional(),
  slug: slugSchema,
  stats: z.object({
    downvotes: z.int().min(0),
    upvotes: z.int().min(0),
    views: z.int().min(0),
  }),
  status: z.enum(["draft", "published", "archived"]),
  title: z.string(),
  tools: z.array(
    z.object({ position: z.int().min(1), toolId: objectIdSchema }),
  ),
  updatedAt: z.iso.datetime().optional(),
});

export type List = z.infer<typeof listSchema>;
