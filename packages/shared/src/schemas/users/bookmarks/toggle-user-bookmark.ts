import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { objectIdSchema } from "@/schemas/object-id.js";
import { slugSchema } from "@/schemas/slug.js";

export const toggleUserBookmarkParamsSchema = z.object({
  userId: objectIdSchema,
});

export type ToggleUserBookmarkParams = z.infer<
  typeof toggleUserBookmarkParamsSchema
>;

export const toggleUserBookmarkBodySchema = z.object({
  toolSlug: slugSchema,
});

export type ToggleUserBookmarkBody = z.infer<
  typeof toggleUserBookmarkBodySchema
>;

export const toggleUserBookmarkResponseSchemas = {
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
