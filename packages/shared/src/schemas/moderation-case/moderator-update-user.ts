import { z } from "zod";

import { defaultResponse } from "../default-response.js";

export const moderatorUpdateUserBodySchema = z.object({
  role: z.enum(["member", "contributor", "moderator"]).optional(),
  status: z.enum(["active", "flagged", "suspended", "deactivated"]).optional(),
  username: z.string().min(1),
});

export type ModeratorUpdateUserBody = z.infer<
  typeof moderatorUpdateUserBodySchema
>;

export const moderatorUpdateUserResponseSchemas = {
  200: z.object({
    data: z.object({
      user: z.object({
        id: z.string(),
        role: z.enum(["member", "contributor", "moderator"]),
        status: z.enum(["active", "flagged", "suspended", "deactivated"]),
        username: z.string(),
      }),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
