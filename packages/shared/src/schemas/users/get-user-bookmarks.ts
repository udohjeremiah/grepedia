import { z } from "zod";

import { defaultResponse } from "../default-response.js";

export const getUserBookmarksParamsSchema = z.object({
  userId: z.string(),
});

export type GetUserBookmarksParams = z.infer<
  typeof getUserBookmarksParamsSchema
>;

export const getUserBookmarksResponseSchemas = {
  200: z.object({
    data: z.object({
      bookmarks: z.array(
        z.object({
          _id: z.string(),
          bookmarkedAt: z.iso.datetime(),
          categories: z.array(z.string()).max(4),
          name: z.string(),
          officialUrl: z.url(),
          shortDescription: z.string(),
          slug: z.string(),
        }),
      ),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
