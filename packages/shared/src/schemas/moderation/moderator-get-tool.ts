import { z } from "zod";

import { defaultResponse } from "../default-response.js";
import { slugSchema } from "../slug.js";

export const moderatorGetToolQuerySchema = z.object({
  slug: slugSchema,
});

export type ModeratorGetToolQuery = z.infer<typeof moderatorGetToolQuerySchema>;

export const moderatorGetToolResponseSchemas = {
  200: z.object({
    data: z.object({
      tool: z.object({
        name: z.string(),
        shortDescription: z.string(),
        slug: slugSchema,
        status: z.enum(["pending", "published", "archived", "flagged"]),
      }),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
