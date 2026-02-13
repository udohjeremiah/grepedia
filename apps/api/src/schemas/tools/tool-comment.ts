import { toolCommentSchema } from "@workspace/shared/schemas/tools/tool-comment.js";
import { ObjectId } from "mongodb";
import { z } from "zod";

export const toolCommentWithObjectIdsSchema = toolCommentSchema.extend({
  _id: z.instanceof(ObjectId).optional(),
  toolId: z.instanceof(ObjectId),
  userId: z.instanceof(ObjectId),
});

export type ToolCommentWithObjectIds = z.infer<
  typeof toolCommentWithObjectIdsSchema
>;
