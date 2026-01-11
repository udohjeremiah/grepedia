import { z } from "zod";

export const userSchema = z.object({
  _id: z.unknown().meta({ bsonType: "objectId" }),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  username: z.string(),
  image: z.url().nullable(),
  role: z.enum(["guest", "contributor", "moderator"]),
  created_at: z.unknown().meta({ bsonType: "date" }),
  updated_at: z.unknown().meta({ bsonType: "date" }),
  status: z.enum(["active", "restricted", "banned"]),
});

export type User = z.infer<typeof userSchema>;
