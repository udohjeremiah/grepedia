import { toolSchema } from "@/schemas/tool.js";
import { z } from "zod";

export const addToolBodySchema = z.object({
  name: z.string().min(1),
  short_description: z.string().min(1),
  long_description: z.string().min(1),
  image: z.url().nullable(),
  cover_image: z.url().nullable(),
  official_url: z.url(),
  external_urls: z.array(z.object({ type: z.string(), url: z.url() })),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
  released_at: z.iso.datetime().nullable(),
});

export const addTool201ResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({ tool: toolSchema }),
});
