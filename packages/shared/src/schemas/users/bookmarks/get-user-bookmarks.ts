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
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
