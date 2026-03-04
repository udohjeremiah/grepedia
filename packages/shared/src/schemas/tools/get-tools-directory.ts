import { z } from "zod";

import { defaultResponse } from "../default-response.js";
import { objectIdSchema } from "../object-id-schema.js";

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
          categories: z.array(z.string()).min(1).max(4),
          image: z.url().optional(),
          name: z.string(),
          officialUrl: z.url(),
          owner: z.string().optional(),
          shortDescription: z.string(),
          slug: z.string(),
          stats: z.object({
            comments: z.int().min(0),
            downvotes: z.int().min(0),
            upvotes: z.int().min(0),
          }),
        }),
      ),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
