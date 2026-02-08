import { z } from "zod";

import { toolSchema } from "@/schemas/tool.js";

export const addToolBodySchema = z.object({
  categories: z.array(z.string()),
  cover_image: z.url().nullable(),
  external_urls: z.array(z.object({ type: z.string(), url: z.url() })),
  image: z.url().nullable(),
  long_description: z.string().min(1),
  name: z.string().min(1),
  official_url: z.url(),
  released_at: z.iso.datetime().nullable(),
  short_description: z.string().min(1),
  tags: z.array(z.string()),
});

export const addTool201ResponseSchema = z.object({
  data: z.object({ tool: toolSchema }),
  message: z.string(),
  success: z.boolean(),
});
