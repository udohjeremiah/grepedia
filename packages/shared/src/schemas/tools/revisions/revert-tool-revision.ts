import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { objectIdSchema } from "@/schemas/object-id.js";
import { slugSchema } from "@/schemas/slug.js";

export const revertToolRevisionParamsSchema = z.object({
  slug: slugSchema,
});

export type RevertToolRevisionParams = z.infer<
  typeof revertToolRevisionParamsSchema
>;

export const revertToolRevisionBodySchema = z.object({
  revisionId: objectIdSchema,
  summary: z.string().min(20).max(1000),
  title: z.string().min(8).max(50),
});

export type RevertToolRevisionBody = z.infer<
  typeof revertToolRevisionBodySchema
>;

export const revertToolRevisionResponseSchemas = {
  200: z.object({
    data: z.object({
      revertedToRevisionId: objectIdSchema,
      revisionNumber: z.int(),
      updatedAt: z.iso.datetime(),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
