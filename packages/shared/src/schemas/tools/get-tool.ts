import { z } from "zod";

import { defaultResponse } from "../default-response.js";
import { slugSchema } from "../slug.js";
import { toolSchema } from "./tool.js";

export const getToolParamsSchema = z.object({
  slug: slugSchema,
});

export type GetToolParams = z.infer<typeof getToolParamsSchema>;

export const getToolResponseSchemas = {
  200: z.object({
    data: z.object({
      tool: toolSchema.extend({
        addedBy: z.string(),
        relations: z.object({
          bookmarked: z.boolean(),
          commented: z.boolean(),
          downvoted: z.boolean(),
          upvoted: z.boolean(),
        }),
        updatedBy: z.string().optional(),
      }),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
