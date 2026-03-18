import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { imageSchema } from "@/schemas/image.js";
import { objectIdSchema } from "@/schemas/object-id.js";
import { slugSchema } from "@/schemas/slug.js";

export const addToolCommentParamsSchema = z.object({
  slug: slugSchema,
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
