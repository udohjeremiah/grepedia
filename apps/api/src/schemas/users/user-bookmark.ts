import { userBookmarkSchema } from "@workspace/shared/schemas/users/user-bookmark.js";
import { ObjectId } from "mongodb";
import { z } from "zod";

export const userBookmarkWithObjectIdsSchema = userBookmarkSchema.extend({
  _id: z.instanceof(ObjectId).optional(),
  createdAt: z.date(),
  toolId: z.instanceof(ObjectId),
  userId: z.instanceof(ObjectId),
});

export type UserBookmarkWithObjectIds = z.infer<
  typeof userBookmarkWithObjectIdsSchema
>;
