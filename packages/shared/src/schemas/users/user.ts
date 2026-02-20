import { z } from "zod";

import { objectIdSchema } from "../object-id-schema.js";

export const userSchema = z.object({
  _id: objectIdSchema,
  bio: z.string().optional(),
  createdAt: z.iso.datetime(),
  displayUsername: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  image: z.url().optional(),
  name: z.string(),
  role: z.enum(["member", "contributor", "moderator"]),
  status: z.enum(["active", "suspended", "deactivated"]),
  updatedAt: z.iso.datetime(),
  username: z.string(),
});

export type User = z.infer<typeof userSchema>;
