import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { objectIdSchema } from "@/schemas/object-id.js";
import { slugSchema } from "@/schemas/slug.js";

export const searchQueryStringSchema = z.object({
  cursor: z.string().optional(),
  limit: z.preprocess((value) => {
    const limit = typeof value === "string" ? Number(value) : value;
    if (typeof limit !== "number" || Number.isNaN(limit)) return;
    return Math.min(Math.max(Math.round(limit), 1), 100);
  }, z.number().optional()),
  query: z
    .string()
    .min(2, "Please provide at least 2 characters.")
    .max(8192, "Please provide no more than 8192 characters."),
  tab: z.enum(["all", "popular", "trending", "new"]).default("all"),
});

export type SearchQueryString = z.infer<typeof searchQueryStringSchema>;

export const searchResponseSchemas = {
  200: z.object({
    data: z.object({
      nextCursor: z.string().optional(),
      tools: z.array(
        z.object({
          _id: objectIdSchema,
          longDescription: z.string(),
          name: z.string(),
          officialUrl: z.string(),
          releasedAt: z.iso.datetime().optional(),
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
