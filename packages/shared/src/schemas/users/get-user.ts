import { z } from "zod";

import { defaultResponse } from "../default-response.js";
import { userSchema } from "./user.js";

export const getUserParamsSchema = z.object({
  userId: z.string(),
});

export type GetUserParams = z.infer<typeof getUserParamsSchema>;

export const getUserResponseSchemas = {
  200: z.object({
    data: z.object({
      user: userSchema,
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
