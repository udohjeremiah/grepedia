import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { slugSchema } from "@/schemas/slug.js";

export const setListReactionParamsSchema = z.object({
  slug: slugSchema,
});

export type SetListReactionParams = z.infer<typeof setListReactionParamsSchema>;

export const setListReactionBodySchema = z.object({
  value: z.union([z.literal(1), z.literal(-1)]),
});

export type SetListReactionBody = z.infer<typeof setListReactionBodySchema>;

export const setListReactionResponseSchemas = {
  200: z.object({
    data: z.object({
      reaction: z.union([z.literal(1), z.literal(-1)]).optional(),
      stats: z.object({ downvotes: z.int(), upvotes: z.int() }),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
