import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { objectIdSchema } from "@/schemas/object-id.js";
import { slugSchema } from "@/schemas/slug.js";

export const deleteToolCommentParamsSchema = z.object({
  commentId: objectIdSchema,
  slug: slugSchema,
});

export type DeleteToolCommentParams = z.infer<
  typeof deleteToolCommentParamsSchema
>;

export const deleteToolCommentResponseSchemas = {
  200: z.object({
    data: z.object({ commentId: objectIdSchema }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
