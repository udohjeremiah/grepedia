import { toolReactionSchema } from "@workspace/shared/schemas/tools/tool-reaction.js";
import { ObjectId } from "mongodb";
import { z } from "zod";

export const toolReactionWithObjectIdsSchema = toolReactionSchema.extend({
  _id: z.instanceof(ObjectId).optional(),
  toolId: z.instanceof(ObjectId),
  userId: z.instanceof(ObjectId),
});

export type ToolReactionWithObjectIds = z.infer<
  typeof toolReactionWithObjectIdsSchema
>;
