import { z } from "zod";

import { discordUrlSchema } from "@/schemas/discord-url.js";
import { objectIdSchema } from "@/schemas/object-id.js";
import { slugSchema } from "@/schemas/slug.js";

import { toolRevisionSnapshotSchema } from "../tools/revisions/tool-revision.js";

export const moderationCaseStatusSchema = z.enum([
  "open",
  "under_review",
  "approved",
  "rejected",
]);

export const moderationCaseTypeSchema = z.enum(["tool_update_proposal"]);

export const moderationCaseBaseSchema = z.object({
  _id: objectIdSchema,
  createdAt: z.iso.datetime(),
  createdBy: objectIdSchema,
  discussionUrl: discordUrlSchema,
  status: moderationCaseStatusSchema,
  type: moderationCaseTypeSchema,
  updatedAt: z.iso.datetime(),
});

const resolutionSchema = z
  .object({
    note: z.string().min(8).max(280).optional(),
    resolvedAt: z.iso.datetime(),
    resolvedBy: objectIdSchema,
  })
  .optional();

const toolUpdatePayloadSchema = z.object({
  changes: toolRevisionSnapshotSchema,
  summary: z.string().min(20).max(1000),
  title: z.string().min(8).max(50),
});

export const moderationCaseSchema = z.discriminatedUnion("type", [
  moderationCaseBaseSchema.extend({
    payload: toolUpdatePayloadSchema,
    resolution: resolutionSchema,
    toolId: objectIdSchema,
    toolSlug: slugSchema,
    type: z.literal("tool_update_proposal"),
  }),
]);

export type ModerationCase = z.infer<typeof moderationCaseSchema>;
