import { z } from "zod";

import { toolSchema } from "@/schemas/tools/tool.js";

import { defaultResponse } from "../default-response.js";

export const addToolBodySchema = z.object({
  categories: z.array(z.string()),
  cover_image: z.url().optional(),
  external_urls: z
    .array(z.object({ type: z.string(), url: z.url() }))
    .optional(),
  image: z.url().optional(),
  long_description: z.string().min(1),
  name: z.string().min(1),
  official_url: z.url(),
  released_at: z.iso.datetime().optional(),
  short_description: z.string().min(1),
  tags: z.array(z.string()),
});

export const addToolResponseSchemas = {
  201: z.object({
    data: z.object({ tool: toolSchema }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
