import { z } from "zod";

import { defaultResponse } from "../default-response.js";
import { objectIdSchema } from "../object-id-schema.js";

export const addToolCommentParamsSchema = z.object({
  slug: z.string().min(1),
});

export type AddToolCommentParams = z.infer<typeof addToolCommentParamsSchema>;

export const addToolCommentBodySchema = z.object({
  content: z
    .string()
    .min(1, "Please enter a comment")
    .max(5000, "Please keep your comment under 5000 characters"),
  parentCommentId: objectIdSchema.optional(),
});

export type AddToolCommentBody = z.infer<typeof addToolCommentBodySchema>;

export const addToolCommentResponseSchemas = {
  201: z.object({
    data: z.object({
      comment: z.object({
        _id: objectIdSchema,
        content: z.string(),
        createdAt: z.iso.datetime(),
        parentCommentId: objectIdSchema.optional(),
        replyCount: z.int().min(0),
        stats: z.object({
          downvotes: z.int().min(0),
          upvotes: z.int().min(0),
        }),
        updatedAt: z.iso.datetime(),
        user: z.object({
          _id: objectIdSchema,
          image: z.url().optional(),
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
