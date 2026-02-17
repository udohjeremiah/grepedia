import { z } from "zod";

import { defaultResponse } from "../default-response.js";

export const addUserBookmarkParamsSchema = z.object({
  userId: z.string(),
});

export type AddUserBookmarkParams = z.infer<typeof addUserBookmarkParamsSchema>;

export const addUserBookmarkBodySchema = z.object({
  toolId: z.string(),
});

export type AddUserBookmarkBody = z.infer<typeof addUserBookmarkBodySchema>;

export const addUserBookmarkResponseSchemas = {
  201: z.object({
    data: z.object({
      bookmarkedAt: z.iso.datetime(),
      bookmarkId: z.string(),
      toolId: z.string(),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
