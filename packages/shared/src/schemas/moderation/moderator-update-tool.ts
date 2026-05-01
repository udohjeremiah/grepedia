import { z } from "zod";

import { defaultResponse } from "../default-response.js";
import { slugSchema } from "../slug.js";

export const moderatorUpdateToolBodySchema = z.object({
  slug: slugSchema,
  status: z.enum(["pending", "published", "archived", "flagged"]),
});

export type ModeratorUpdateToolBody = z.infer<
  typeof moderatorUpdateToolBodySchema
>;

export const moderatorUpdateToolResponseSchemas = {
  200: z.object({
    data: z.object({
      tool: z.object({
        slug: slugSchema,
        status: z.enum(["pending", "published", "archived", "flagged"]),
      }),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
