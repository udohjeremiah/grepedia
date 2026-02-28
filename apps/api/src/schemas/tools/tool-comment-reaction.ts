import { toolCommentReactionSchema } from "@workspace/shared/schemas/tools/tool-comment-reaction.js";
import { ObjectId } from "mongodb";
import { z } from "zod";

export const toolCommentReactionWithObjectIdsSchema =
  toolCommentReactionSchema.extend({
    _id: z.instanceof(ObjectId).optional(),
    commentId: z.instanceof(ObjectId),
    createdAt: z.date(),
    updatedAt: z.date(),
    userId: z.instanceof(ObjectId),
  });

export type ToolCommentReactionWithObjectIds = z.infer<
  typeof toolCommentReactionWithObjectIdsSchema
>;
