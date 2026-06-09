import { listReactionSchema } from "@workspace/shared/schemas/lists/reactions/list-reaction.js";
import { ObjectId } from "mongodb";
import { z } from "zod";

export const listReactionWithObjectIdsSchema = listReactionSchema.extend({
  _id: z.instanceof(ObjectId).optional(),
  createdAt: z.date(),
  listId: z.instanceof(ObjectId),
  updatedAt: z.date(),
  userId: z.instanceof(ObjectId),
});

export type ListReactionWithObjectIds = z.infer<
  typeof listReactionWithObjectIdsSchema
>;
