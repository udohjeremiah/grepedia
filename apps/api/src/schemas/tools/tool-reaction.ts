import { toolReactionSchema } from "@workspace/shared/schemas/tools/reactions/tool-reaction";
import { ObjectId } from "mongodb";
import { z } from "zod";

export const toolReactionWithObjectIdsSchema = toolReactionSchema.extend({
  _id: z.instanceof(ObjectId).optional(),
  createdAt: z.date(),
  toolId: z.instanceof(ObjectId),
  updatedAt: z.date(),
  userId: z.instanceof(ObjectId),
});

export type ToolReactionWithObjectIds = z.infer<
  typeof toolReactionWithObjectIdsSchema
>;
