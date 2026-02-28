import { z } from "zod";

import { defaultResponse } from "../default-response.js";
import { objectIdSchema } from "../object-id-schema.js";

export const getToolCommentRepliesParamsSchema = z.object({
  commentId: objectIdSchema,
  slug: z.string().min(1),
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
      ),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
