import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { objectIdSchema } from "@/schemas/object-id.js";

import { listSchema } from "./list.js";

export const getListsQueryStringSchema = z.object({
  createdBy: objectIdSchema.optional(),
});

export type GetListsQueryString = z.infer<typeof getListsQueryStringSchema>;

export const getListsResponseSchemas = {
  200: z.object({
    data: z.object({
      lists: z.array(
        listSchema.omit({ tools: true }).extend({ toolCount: z.int().min(0) }),
      ),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
