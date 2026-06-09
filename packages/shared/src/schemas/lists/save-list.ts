import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { objectIdSchema } from "@/schemas/object-id.js";

import { slugSchema } from "../slug.js";

export const saveListBodySchema = z.object({
  description: z
    .string()
    .min(20, "Please provide at least 20 characters")
    .max(500, "Please provide no more than 500 characters"),
  slug: slugSchema.optional(),
  title: z
    .string()
    .min(8, "Please provide at least 8 characters")
    .max(120, "Please provide no more than 120 characters"),
  tools: z
    .array(z.object({ position: z.int().min(1), toolId: objectIdSchema }))
    .min(1, "Please provide at least 1 tool")
    .max(50, "You can add up to 50 tools"),
});

export type SaveListBody = z.infer<typeof saveListBodySchema>;

export const saveListResponseSchemas = {
  201: z.object({
    data: z.object({
      listId: objectIdSchema,
      listSlug: slugSchema,
      savedAt: z.iso.datetime(),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
