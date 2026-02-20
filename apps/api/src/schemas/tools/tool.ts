import { toolSchema } from "@workspace/shared/schemas/tools/tool";
import { ObjectId } from "mongodb";
import { z } from "zod";

export const toolWithVectorEmbeddingsSchema = toolSchema.extend({
  vectorEmbeddings: z.array(z.number()).optional(),
});

export const toolWithObjectIdsSchema = toolWithVectorEmbeddingsSchema.extend({
  _id: z.instanceof(ObjectId).optional(),
  addedBy: z.instanceof(ObjectId),
  owner: z.instanceof(ObjectId).optional(),
  updatedBy: z.instanceof(ObjectId).optional(),
});

export type ToolWithObjectIds = z.infer<typeof toolWithObjectIdsSchema>;
export type ToolWithVectorEmbeddings = z.infer<
  typeof toolWithVectorEmbeddingsSchema
>;
