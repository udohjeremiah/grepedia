import { z } from "zod";

import { defaultResponse } from "../default-response.js";

export const getToolsDirectoryCategoriesResponseSchemas = {
  200: z.object({
    data: z.object({
      categories: z.array(
        z.object({
          count: z.int().min(0),
          name: z.string(),
        }),
      ),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
