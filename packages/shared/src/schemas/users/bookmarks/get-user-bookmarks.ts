import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { objectIdSchema } from "@/schemas/object-id.js";
import { slugSchema } from "@/schemas/slug.js";

export const getUserBookmarksParamsSchema = z.object({
  userId: objectIdSchema,
});

export type GetUserBookmarksParams = z.infer<
  typeof getUserBookmarksParamsSchema
>;

export const getUserBookmarksQueryStringSchema = z.object({
  cursor: z.string().optional(),
  limit: z.preprocess((value) => {
    const limit = typeof value === "string" ? Number(value) : value;
    if (typeof limit !== "number" || Number.isNaN(limit)) return;
    return Math.min(Math.max(Math.round(limit), 1), 50);
  }, z.number().optional()),
});

export type GetUserBookmarksQueryString = z.infer<
  typeof getUserBookmarksQueryStringSchema
>;

export const getUserBookmarksResponseSchemas = {
  200: z.object({
    data: z.object({
      bookmarks: z.array(
        z.object({
          _id: objectIdSchema,
          bookmarkedAt: z.iso.datetime(),
          categories: z.array(z.string()),
          name: z.string(),
          officialUrl: z.url(),
          shortDescription: z.string(),
          slug: slugSchema,
        }),
      ),
      nextCursor: z.string().optional(),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
