import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { discordUrlSchema } from "@/schemas/discord-url.js";
import { objectIdSchema } from "@/schemas/object-id.js";
import { slugSchema } from "@/schemas/slug.js";

export const submitToolClaimParamsSchema = z.object({
  slug: slugSchema,
});

export type SubmitToolClaimParams = z.infer<typeof submitToolClaimParamsSchema>;

export const submitToolClaimBodySchema = z.object({
  discussionUrl: discordUrlSchema,
  reason: z.string().min(8).max(2000),
});

export type SubmitToolClaimBody = z.infer<typeof submitToolClaimBodySchema>;

export const submitToolClaimResponseSchemas = {
  201: z.object({
    data: z.object({
      caseId: objectIdSchema,
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
