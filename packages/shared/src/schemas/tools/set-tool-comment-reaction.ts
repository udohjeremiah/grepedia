import { z } from "zod";

import { defaultResponse } from "../default-response.js";
import { objectIdSchema } from "../object-id-schema.js";

export const setToolCommentReactionParamsSchema = z.object({
  commentId: objectIdSchema,
  slug: z.string().min(1),
});

export type SetToolCommentReactionParams = z.infer<
  typeof setToolCommentReactionParamsSchema
>;

export const setToolCommentReactionBodySchema = z.object({
  value: z.union([z.literal(1), z.literal(-1)]),
});

export type SetToolCommentReactionBody = z.infer<
  typeof setToolCommentReactionBodySchema
>;

export const setToolCommentReactionResponseSchemas = {
  200: z.object({
    data: z.object({
      commentId: objectIdSchema,
      reaction: z.union([z.literal(1), z.literal(-1)]).optional(),
      stats: z.object({
        downvotes: z.int().min(0),
        upvotes: z.int().min(0),
      }),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
