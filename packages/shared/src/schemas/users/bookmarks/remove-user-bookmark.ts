import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { objectIdSchema } from "@/schemas/object-id.js";

export const removeUserBookmarkParamsSchema = z.object({
  bookmarkId: objectIdSchema,
  userId: objectIdSchema,
});

export type RemoveUserBookmarkParams = z.infer<
  typeof removeUserBookmarkParamsSchema
>;

export const removeUserBookmarkResponseSchemas = {
  200: z.object({
    data: z.object({
      bookmarkId: objectIdSchema,
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
