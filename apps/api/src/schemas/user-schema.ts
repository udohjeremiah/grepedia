import { ObjectId } from "mongodb";
import { z } from "zod";

export const userSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  username: z.string(),
  image: z.url().nullable(),
  role: z.enum(["guest", "contributor", "moderator"]),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  status: z.enum(["active", "restricted", "banned"]),
});

export const userWithObjectIds = userSchema.extend({
  _id: z.instanceof(ObjectId).optional(),
});

export type User = z.infer<typeof userSchema>;
export type UserWithObjectIds = z.infer<typeof userWithObjectIds>;
