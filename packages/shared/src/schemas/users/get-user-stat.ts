import { z } from "zod";

import { defaultResponse } from "../default-response.js";

export const getUserStatParamsSchema = z.object({
  userId: z.string(),
});

export type GetUserStatParams = z.infer<typeof getUserStatParamsSchema>;

export const getUserStatResponseSchemas = {
  200: z.object({
    data: z.object({
      stat: z.object({
        bookmarks: z.int(),
        sessions: z.int(),
        tools: z.int(),
      }),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
