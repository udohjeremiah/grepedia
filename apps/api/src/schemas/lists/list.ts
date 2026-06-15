import { listSchema } from "@workspace/shared/schemas/lists/list";
import { ObjectId } from "mongodb";
import { z } from "zod";

export const listWithObjectIdsSchema = listSchema.extend({
  _id: z.instanceof(ObjectId).optional(),
  archivedAt: z.date().optional(),
  createdAt: z.date(),
  createdBy: z.instanceof(ObjectId),
  isOfficial: z.boolean().optional(),
  publishedAt: z.date().optional(),
  tools: z.array(
    z.object({
      position: z.number().int().min(1),
      toolId: z.instanceof(ObjectId),
    }),
  ),
  updatedAt: z.date().optional(),
});

export type ListWithObjectIds = z.infer<typeof listWithObjectIdsSchema>;
