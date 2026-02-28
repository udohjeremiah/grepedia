import { z } from "zod";

import { defaultResponse } from "../default-response.js";
import { toolSchema } from "./tool.js";

export const getToolParamsSchema = z.object({
  slug: z.string().min(1),
});

export type GetToolParams = z.infer<typeof getToolParamsSchema>;

export const getToolResponseSchemas = {
  200: z.object({
    data: z.object({
      tool: toolSchema.extend({
        addedBy: z.string(),
        owner: z.string().optional(),
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
