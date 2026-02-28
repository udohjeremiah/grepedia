import { toolCommentSchema } from "@workspace/shared/schemas/tools/tool-comment.js";
import { ObjectId } from "mongodb";
import { z } from "zod";

export const toolCommentWithObjectIdsSchema = toolCommentSchema.extend({
  _id: z.instanceof(ObjectId).optional(),
  createdAt: z.date(),
  parentCommentId: z.instanceof(ObjectId).optional(),
  replyCount: z.int().min(0),
  toolId: z.instanceof(ObjectId),
  updatedAt: z.date(),
  userId: z.instanceof(ObjectId),
});

export type ToolCommentWithObjectIds = z.infer<
  typeof toolCommentWithObjectIdsSchema
>;
