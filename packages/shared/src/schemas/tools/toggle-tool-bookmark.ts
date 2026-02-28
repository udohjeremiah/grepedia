import { z } from "zod";

import { defaultResponse } from "../default-response.js";
import { objectIdSchema } from "../object-id-schema.js";

export const toggleToolBookmarkParamsSchema = z.object({
  slug: z.string().min(1),
});

export type ToggleToolBookmarkParams = z.infer<
  typeof toggleToolBookmarkParamsSchema
>;

export const toggleToolBookmarkResponseSchemas = {
  200: z.object({
    data: z.object({
      bookmarked: z.boolean(),
      bookmarkId: objectIdSchema.optional(),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
