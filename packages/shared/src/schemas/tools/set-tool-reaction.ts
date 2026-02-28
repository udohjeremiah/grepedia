import { z } from "zod";

import { defaultResponse } from "../default-response.js";

export const setToolReactionParamsSchema = z.object({
  slug: z.string().min(1),
});

export type SetToolReactionParams = z.infer<typeof setToolReactionParamsSchema>;

export const setToolReactionBodySchema = z.object({
  value: z.union([z.literal(1), z.literal(-1)]),
});

export type SetToolReactionBody = z.infer<typeof setToolReactionBodySchema>;

export const setToolReactionResponseSchemas = {
  200: z.object({
    data: z.object({
      reaction: z.union([z.literal(1), z.literal(-1)]).optional(),
      stats: z.object({
        downvotes: z.int().min(0),
        upvotes: z.int().min(0),
      }),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
