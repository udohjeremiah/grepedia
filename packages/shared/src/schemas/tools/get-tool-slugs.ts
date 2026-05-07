import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { slugSchema } from "@/schemas/slug.js";

export const getToolSlugsQueryStringSchema = z.object({
  cursor: z.string().optional(),
  limit: z.preprocess((value) => {
    const limit = typeof value === "string" ? Number(value) : value;
    if (typeof limit !== "number" || Number.isNaN(limit)) return;
    return Math.min(Math.max(Math.round(limit), 1), 5000);
  }, z.number().optional()),
});

export const getToolSlugsResponseSchemas = {
  200: z.object({
    data: z.object({
      nextCursor: z.string().optional(),
      tools: z.array(
        z.object({
          slug: slugSchema,
          updatedAt: z.iso.datetime().optional(),
        }),
      ),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};

export type GetToolSlugsQueryString = z.infer<
  typeof getToolSlugsQueryStringSchema
>;
