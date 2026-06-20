import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { objectIdSchema } from "@/schemas/object-id.js";

import { listSchema } from "./list.js";

export const getListsQueryStringSchema = z.object({
  createdBy: objectIdSchema.optional(),
  cursor: z.string().optional(),
  limit: z.preprocess((value) => {
    const limit = typeof value === "string" ? Number(value) : value;
    if (typeof limit !== "number" || Number.isNaN(limit)) return;
    return Math.min(Math.max(Math.round(limit), 1), 50);
  }, z.number().optional()),
});

export type GetListsQueryString = z.infer<typeof getListsQueryStringSchema>;

export const getListsResponseSchemas = {
  200: z.object({
    data: z.object({
      lists: z.array(
        listSchema.omit({ tools: true }).extend({ toolCount: z.int().min(0) }),
      ),
      nextCursor: z.string().optional(),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
