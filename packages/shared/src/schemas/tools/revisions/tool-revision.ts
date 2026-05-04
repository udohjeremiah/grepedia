import { z } from "zod";

import { objectIdSchema } from "@/schemas/object-id.js";

import { officialUrlSchema, publicUrlSchema } from "../../url-policy.js";

export const toolRevisionSnapshotSchema = z.object({
  categories: z.array(z.string()).min(1).max(4),
  externalUrls: z
    .array(z.object({ platform: z.string(), url: publicUrlSchema }))
    .max(4)
    .optional(),
  longDescription: z.string(),
  name: z.string(),
  officialUrl: officialUrlSchema,
  releasedAt: z.iso.datetime().optional(),
  shortDescription: z.string(),
  tags: z.array(z.string()).min(1).max(8),
});

export const toolRevisionSchema = z.object({
  _id: objectIdSchema,
  createdAt: z.iso.datetime(),
  createdBy: z.string(),
  isRevert: z.boolean(),
  linkedDiscussionId: objectIdSchema.optional(),
  linkedDiscussionUrl: z.url().optional(),
  revertedFromRevisionId: objectIdSchema.optional(),
  revisionNumber: z.int().min(1),
  summary: z.string(),
  title: z.string(),
  toolId: objectIdSchema,
  toolSlug: z.string(),
});

export type ToolRevision = z.infer<typeof toolRevisionSchema>;
