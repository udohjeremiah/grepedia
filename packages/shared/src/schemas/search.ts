import { z } from "zod";

import { toolSchema } from "@/schemas/tool.js";

export const searchQueryStringSchema = z.object({
  cursor: z.string().optional(),
  limit: z.preprocess((value) => {
    const limit = typeof value === "string" ? Number(value) : value;
    if (typeof limit !== "number" || Number.isNaN(limit)) return;
    return Math.min(Math.max(limit, 1), 100);
  }, z.number().optional()),
  query: z
    .string()
    .min(2, "Please provide at least 2 characters.")
    .max(8192, "Please keep it under 8192 characters."),
  tab: z.enum(["all", "popular", "trending", "verified", "new"]).default("all"),
});

export type SearchQueryString = z.infer<typeof searchQueryStringSchema>;

export const search200ResponseSchema = z.object({
  data: z.object({
    nextCursor: z.string().nullable(),
    tools: z.array(toolSchema),
  }),
  message: z.string(),
  success: z.boolean(),
});
