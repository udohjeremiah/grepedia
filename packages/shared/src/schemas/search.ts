import { toolSchema } from "@/schemas/tool.js";
import { z } from "zod";

export const searchQueryStringSchema = z.object({
  query: z
    .string()
    .min(2, "Please provide at least 2 characters.")
    .max(8192, "Please keep it under 8192 characters."),
  tab: z.enum(["all", "popular", "trending", "verified", "new"]).default("all"),
  limit: z.preprocess((value) => {
    const num = typeof value === "string" ? Number(value) : value;
    if (typeof num !== "number" || Number.isNaN(num)) return undefined;
    return Math.min(Math.max(num, 1), 100);
  }, z.number().optional()),
  cursor: z.string().optional(),
});

export type SearchQueryString = z.infer<typeof searchQueryStringSchema>;

export const search200ResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    tools: z.array(toolSchema),
    nextCursor: z.string().nullable(),
  }),
});
