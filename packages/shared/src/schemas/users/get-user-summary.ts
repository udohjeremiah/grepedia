import { z } from "zod";

import { defaultResponse } from "../default-response.js";

export const getUserSummaryParamsSchema = z.object({
  id: z.string(),
});

export type GetUserSummaryParams = z.infer<typeof getUserSummaryParamsSchema>;

export const getUserSummaryResponseSchemas = {
  200: z.object({
    data: z.object({
      activities: z.int(),
      bookmarks: z.int(),
      sessions: z.int(),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
