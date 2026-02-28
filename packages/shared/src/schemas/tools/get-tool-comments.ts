import { z } from "zod";

import { defaultResponse } from "../default-response.js";
import { objectIdSchema } from "../object-id-schema.js";

export const getToolCommentsParamsSchema = z.object({
  slug: z.string().min(1),
});

export type GetToolCommentsParams = z.infer<typeof getToolCommentsParamsSchema>;

export const getToolCommentsQueryStringSchema = z.object({
  cursor: z.string().optional(),
  limit: z.preprocess((value) => {
    const limit = typeof value === "string" ? Number(value) : value;
    if (typeof limit !== "number" || Number.isNaN(limit)) return;
    return Math.min(Math.max(Math.round(limit), 1), 100);
  }, z.number().optional()),
});

export type GetToolCommentsQueryString = z.infer<
  typeof getToolCommentsQueryStringSchema
>;

export const getToolCommentsResponseSchemas = {
  200: z.object({
    data: z.object({
      comments: z.array(
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
      nextCursor: z.string().optional(),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
