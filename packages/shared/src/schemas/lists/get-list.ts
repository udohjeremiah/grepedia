import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { slugSchema } from "@/schemas/slug.js";

import { toolSchema } from "../tools/tool.js";
import { listSchema } from "./list.js";

export const getListParamsSchema = z.object({ slug: slugSchema });

export type GetListParams = z.infer<typeof getListParamsSchema>;

export const getListResponseSchemas = {
  200: z.object({
    data: z.object({
      list: listSchema.extend({
        relations: z
          .object({
            reaction: z.union([z.literal(1), z.literal(-1)]).optional(),
          })
          .optional(),
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
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
