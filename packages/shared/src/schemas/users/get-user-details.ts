import { z } from "zod";

import { defaultResponse } from "../default-response.js";
import { userSchema } from "./user.js";

export const getUserDetailsParamsSchema = z.object({
  id: z.string(),
});

export type GetUserDetailsParams = z.infer<typeof getUserDetailsParamsSchema>;

export const getUserDetailsResponseSchemas = {
  200: z.object({
    data: userSchema,
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
