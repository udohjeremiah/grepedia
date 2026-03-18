import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { imageSchema } from "@/schemas/image.js";
import { objectIdSchema } from "@/schemas/object-id.js";
import { slugSchema } from "@/schemas/slug.js";

export const updateToolCommentParamsSchema = z.object({
  commentId: objectIdSchema,
  slug: slugSchema,
});

export type UpdateToolCommentParams = z.infer<
  typeof updateToolCommentParamsSchema
>;

export const updateToolCommentBodySchema = z.object({
  content: z
    .string()
    .min(1, "Please enter a comment")
    .max(5000, "Please keep your comment under 5000 characters"),
});

export type UpdateToolCommentBody = z.infer<typeof updateToolCommentBodySchema>;

export const updateToolCommentResponseSchemas = {
  200: z.object({
    data: z.object({
      comment: z.object({
        _id: objectIdSchema,
        content: z.string(),
        createdAt: z.iso.datetime(),
        parentCommentId: objectIdSchema.optional(),
        replyCount: z.int(),
        stats: z.object({
          downvotes: z.int(),
          upvotes: z.int(),
        }),
        updatedAt: z.iso.datetime(),
        user: z.object({
          _id: objectIdSchema,
          image: imageSchema.optional(),
          name: z.string(),
          username: z.string(),
        }),
        viewerReaction: z.union([z.literal(1), z.literal(-1)]).optional(),
      }),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
