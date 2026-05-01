import { z } from "zod";

import { defaultResponse } from "../default-response.js";
import { objectIdSchema } from "../object-id.js";
import { slugSchema } from "../slug.js";

export const moderatorGetCommentQuerySchema = z.object({
  commentId: objectIdSchema,
});

export type ModeratorGetCommentQuery = z.infer<
  typeof moderatorGetCommentQuerySchema
>;

export const moderatorGetCommentResponseSchemas = {
  200: z.object({
    data: z.object({
      comment: z.object({
        _id: objectIdSchema,
        content: z.string(),
        createdAt: z.iso.datetime(),
        parentCommentId: objectIdSchema.optional(),
        replyCount: z.int().min(0),
        status: z.enum(["active", "flagged"]),
        toolSlug: slugSchema,
        updatedAt: z.iso.datetime(),
        user: z.object({
          name: z.string(),
          username: z.string(),
        }),
      }),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
