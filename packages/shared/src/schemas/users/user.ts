import { z } from "zod";

import { imageSchema } from "../image.js";
import { objectIdSchema } from "../object-id.js";

export const userSchema = z.object({
  _id: objectIdSchema,
  bio: z.string().optional(),
  country: z.string().length(2).optional(),
  createdAt: z.iso.datetime(),
  displayUsername: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  gender: z
    .enum(["male", "female", "nonBinary", "other", "preferNotToSay"])
    .optional(),
  image: imageSchema.optional(),
  name: z.string(),
  role: z.enum(["member", "contributor", "moderator"]),
  status: z.enum(["active", "flagged", "suspended", "deactivated"]),
  updatedAt: z.iso.datetime(),
  username: z.string(),
});

export type User = z.infer<typeof userSchema>;
