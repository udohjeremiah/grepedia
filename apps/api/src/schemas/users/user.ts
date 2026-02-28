import { userSchema } from "@workspace/shared/schemas/users/user";
import { ObjectId } from "mongodb";
import { z } from "zod";

export const userWithObjectIdsSchema = userSchema.extend({
  _id: z.instanceof(ObjectId).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserWithObjectIds = z.infer<typeof userWithObjectIdsSchema>;
