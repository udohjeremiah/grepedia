import { z } from "zod";

import { defaultResponse } from "../default-response.js";

export const getToolsStatsResponseSchemas = {
  200: z.object({
    data: z.object({
      stats: z.object({
        contributors: z.int(),
        reviews: z.int(),
        tools: z.int(),
      }),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
