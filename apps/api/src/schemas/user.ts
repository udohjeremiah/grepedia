import { userSchema } from "@workspace/shared/schemas/user";
import { ObjectId } from "mongodb";
import { z } from "zod";

export const userWithObjectIdsSchema = userSchema.extend({
  _id: z.instanceof(ObjectId).optional(),
});

export type UserWithObjectIds = z.infer<typeof userWithObjectIdsSchema>;
