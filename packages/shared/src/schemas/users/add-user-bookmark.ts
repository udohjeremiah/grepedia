import { z } from "zod";

import { defaultResponse } from "../default-response.js";
import { objectIdSchema } from "../object-id-schema.js";

export const addUserBookmarkParamsSchema = z.object({
  userId: objectIdSchema,
});

export type AddUserBookmarkParams = z.infer<typeof addUserBookmarkParamsSchema>;

export const addUserBookmarkBodySchema = z.object({
  toolId: objectIdSchema,
});

export type AddUserBookmarkBody = z.infer<typeof addUserBookmarkBodySchema>;

export const addUserBookmarkResponseSchemas = {
  201: z.object({
    data: z.object({
      bookmarkedAt: z.iso.datetime(),
      bookmarkId: objectIdSchema,
      toolId: objectIdSchema,
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
