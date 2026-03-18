import { toolSchema } from "@workspace/shared/schemas/tools/tool";
import { ObjectId } from "mongodb";
import { z } from "zod";

export const toolWithObjectIdsSchema = toolSchema.extend({
  _id: z.instanceof(ObjectId).optional(),
  addedAt: z.date(),
  addedBy: z.instanceof(ObjectId),
  owner: z.instanceof(ObjectId).optional(),
  releasedAt: z.date().optional(),
  updatedAt: z.date().optional(),
  updatedBy: z.instanceof(ObjectId).optional(),
  vectorEmbeddings: z.array(z.number()).optional(),
});

export type ToolWithObjectIds = z.infer<typeof toolWithObjectIdsSchema>;
