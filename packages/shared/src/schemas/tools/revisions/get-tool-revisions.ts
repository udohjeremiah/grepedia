import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { objectIdSchema } from "@/schemas/object-id.js";
import { slugSchema } from "@/schemas/slug.js";

import { toolRevisionSnapshotSchema } from "./tool-revision.js";

export const getToolRevisionsParamsSchema = z.object({
  slug: slugSchema,
});

export type GetToolRevisionsParams = z.infer<
  typeof getToolRevisionsParamsSchema
>;

export const getToolRevisionsQueryStringSchema = z.object({
  cursor: z.string().optional(),
  limit: z.preprocess((value) => {
    const limit = typeof value === "string" ? Number(value) : value;
    if (typeof limit !== "number" || Number.isNaN(limit)) return;
    return Math.min(Math.max(Math.round(limit), 1), 50);
  }, z.number().optional()),
});

export type GetToolRevisionsQueryString = z.infer<
  typeof getToolRevisionsQueryStringSchema
>;

export const getToolRevisionsResponseSchemas = {
  200: z.object({
    data: z.object({
      nextCursor: z.string().optional(),
      revisions: z.array(
        z.object({
          _id: objectIdSchema,
          createdAt: z.iso.datetime(),
          createdBy: z.string(),
          isRevert: z.boolean(),
          linkedDiscussionId: objectIdSchema.optional(),
          linkedDiscussionUrl: z.url().optional(),
          revertedFromRevisionId: objectIdSchema.optional(),
          revisionNumber: z.int(),
          snapshot: toolRevisionSnapshotSchema,
          summary: z.string(),
          title: z.string(),
        }),
      ),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
