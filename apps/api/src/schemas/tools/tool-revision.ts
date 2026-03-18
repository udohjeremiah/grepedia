import {
  toolRevisionSchema,
  toolRevisionSnapshotSchema,
} from "@workspace/shared/schemas/tools/revisions/tool-revision.js";
import { ObjectId } from "mongodb";
import { z } from "zod";

export const toolRevisionWithObjectIdsSchema = toolRevisionSchema.extend({
  _id: z.instanceof(ObjectId).optional(),
  createdAt: z.date(),
  createdBy: z.instanceof(ObjectId),
  linkedDiscussionId: z.instanceof(ObjectId).optional(),
  revertedFromRevisionId: z.instanceof(ObjectId).optional(),
  snapshot: toolRevisionSnapshotSchema.extend({
    releasedAt: z.date().optional(),
  }),
  toolId: z.instanceof(ObjectId),
});

export type ToolRevisionWithObjectIds = z.infer<
  typeof toolRevisionWithObjectIdsSchema
>;
