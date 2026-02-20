import { z } from "zod";

import { defaultResponse } from "../default-response.js";
import { objectIdSchema } from "../object-id-schema.js";

export const getUserStatsParamsSchema = z.object({
  userId: objectIdSchema,
});

export type GetUserStatsParams = z.infer<typeof getUserStatsParamsSchema>;

export const getUserStatsResponseSchemas = {
  200: z.object({
    data: z.object({
      stats: z.object({
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
