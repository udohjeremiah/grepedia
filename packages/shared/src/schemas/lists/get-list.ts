import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { slugSchema } from "@/schemas/slug.js";

import { toolSchema } from "../tools/tool.js";
import { listSchema } from "./list.js";

export const getListParamsSchema = z.object({ slug: slugSchema });

export type GetListParams = z.infer<typeof getListParamsSchema>;

export const getListQueryStringSchema = z.object({
  cursor: z.string().optional(),
  limit: z.preprocess((value) => {
    const limit = typeof value === "string" ? Number(value) : value;
    if (typeof limit !== "number" || Number.isNaN(limit)) return;
    return Math.min(Math.max(Math.round(limit), 1), 50);
  }, z.number().optional()),
});

export type GetListQueryString = z.infer<typeof getListQueryStringSchema>;

export const getListResponseSchemas = {
  200: z.object({
    data: z.object({
      list: listSchema.omit({ tools: true }).extend({
        relations: z
          .object({
            reaction: z.union([z.literal(1), z.literal(-1)]).optional(),
          })
          .optional(),
      }),
      nextCursor: z.string().optional(),
      tools: z.array(
        toolSchema.pick({
          _id: true,
          categories: true,
          name: true,
          officialUrl: true,
          shortDescription: true,
          slug: true,
          stats: true,
          tags: true,
        }),
      ),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
