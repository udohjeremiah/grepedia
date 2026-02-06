import { toolSchema } from "@workspace/shared/schemas/tool";
import { ObjectId } from "mongodb";
import { z } from "zod";

export const toolWithVectorEmbeddingsSchema = toolSchema.extend({
  vectorEmbeddings: z.array(z.number()),
});

export const toolWithObjectIdsSchema = toolWithVectorEmbeddingsSchema.extend({
  _id: z.instanceof(ObjectId).optional(),
  owner: z.instanceof(ObjectId).nullable(),
  added_by: z.instanceof(ObjectId),
  updated_by: z.instanceof(ObjectId).nullable(),
});

export type ToolWithVectorEmbeddings = z.infer<
  typeof toolWithVectorEmbeddingsSchema
>;
export type ToolWithObjectIds = z.infer<typeof toolWithObjectIdsSchema>;
