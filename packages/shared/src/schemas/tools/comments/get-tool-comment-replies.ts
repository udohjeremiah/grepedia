import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { imageSchema } from "@/schemas/image.js";
import { objectIdSchema } from "@/schemas/object-id.js";
import { slugSchema } from "@/schemas/slug.js";

export const getToolCommentRepliesParamsSchema = z.object({
  commentId: objectIdSchema,
  slug: slugSchema,
});

export type GetToolCommentRepliesParams = z.infer<
  typeof getToolCommentRepliesParamsSchema
>;

export const getToolCommentRepliesQueryStringSchema = z.object({
  cursor: z.string().optional(),
  limit: z.preprocess((value) => {
    const limit = typeof value === "string" ? Number(value) : value;
    if (typeof limit !== "number" || Number.isNaN(limit)) return;
    return Math.min(Math.max(Math.round(limit), 1), 100);
  }, z.number().optional()),
});

export type GetToolCommentRepliesQueryString = z.infer<
  typeof getToolCommentRepliesQueryStringSchema
>;

export const getToolCommentRepliesResponseSchemas = {
  200: z.object({
    data: z.object({
      nextCursor: z.string().optional(),
      replies: z.array(
        z.object({
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
      ),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
