import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { objectIdSchema } from "@/schemas/object-id.js";
import { slugSchema } from "@/schemas/slug.js";

export const moderatorGetCommentQueryStringSchema = z.object({
  commentId: objectIdSchema,
});

export type ModeratorGetCommentQueryString = z.infer<
  typeof moderatorGetCommentQueryStringSchema
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
