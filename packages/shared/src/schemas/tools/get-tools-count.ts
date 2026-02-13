import { z } from "zod";

import { defaultResponse } from "../default-response.js";

export const getToolsCountResponseSchemas = {
  200: z.object({
    data: z.int(),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
