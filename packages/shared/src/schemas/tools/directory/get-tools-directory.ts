import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { imageSchema } from "@/schemas/image.js";
import { objectIdSchema } from "@/schemas/object-id.js";
import { slugSchema } from "@/schemas/slug.js";

export const getToolsDirectoryQueryStringSchema = z.object({
  category: z.string().min(1).max(64),
  cursor: z.string().optional(),
  limit: z.preprocess((value) => {
    const limit = typeof value === "string" ? Number(value) : value;
    if (typeof limit !== "number" || Number.isNaN(limit)) return;
    return Math.min(Math.max(Math.round(limit), 1), 50);
  }, z.number().optional()),
});

export type GetToolsDirectoryQueryString = z.infer<
  typeof getToolsDirectoryQueryStringSchema
>;

export const getToolsDirectoryResponseSchemas = {
  200: z.object({
    data: z.object({
      category: z.string(),
      nextCursor: z.string().optional(),
      tools: z.array(
        z.object({
          _id: objectIdSchema,
          categories: z.array(z.string()),
          image: imageSchema.optional(),
          name: z.string(),
          officialUrl: z.url(),
          shortDescription: z.string(),
          slug: slugSchema,
          stats: z.object({
            comments: z.int(),
            downvotes: z.int(),
            upvotes: z.int(),
          }),
        }),
      ),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
