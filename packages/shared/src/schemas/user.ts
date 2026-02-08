import { z } from "zod";

export const userSchema = z.object({
  _id: z.string(),
  created_at: z.iso.datetime(),
  displayUsername: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  image: z.url().nullable(),
  name: z.string(),
  role: z.enum(["guest", "contributor", "moderator"]),
  status: z.enum(["active", "restricted", "banned"]),
  updated_at: z.iso.datetime(),
  username: z.string(),
});

export type User = z.infer<typeof userSchema>;
