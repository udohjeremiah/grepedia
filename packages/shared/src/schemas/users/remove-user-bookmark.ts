import { z } from "zod";

import { defaultResponse } from "../default-response.js";

export const removeUserBookmarkParamsSchema = z.object({
  bookmarkId: z.string(),
  userId: z.string(),
});

export type RemoveUserBookmarkParams = z.infer<
  typeof removeUserBookmarkParamsSchema
>;

export const removeUserBookmarkResponseSchemas = {
  200: z.object({
    data: z.object({
      bookmarkId: z.string(),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
