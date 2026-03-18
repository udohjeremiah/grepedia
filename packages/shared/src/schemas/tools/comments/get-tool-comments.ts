import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { imageSchema } from "@/schemas/image.js";
import { objectIdSchema } from "@/schemas/object-id.js";
import { slugSchema } from "@/schemas/slug.js";

export const getToolCommentsParamsSchema = z.object({
  slug: slugSchema,
});

export type GetToolCommentsParams = z.infer<typeof getToolCommentsParamsSchema>;

export const getToolCommentsQueryStringSchema = z.object({
  cursor: z.string().optional(),
  limit: z.preprocess((value) => {
    const limit = typeof value === "string" ? Number(value) : value;
    if (typeof limit !== "number" || Number.isNaN(limit)) return;
    return Math.min(Math.max(Math.round(limit), 1), 100);
  }, z.number().optional()),
  sort: z.enum(["bottom", "newest", "top"]).optional(),
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
      nextCursor: z.string().optional(),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
