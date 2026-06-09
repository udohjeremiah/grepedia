import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { slugSchema } from "@/schemas/slug.js";

import { listSchema } from "./list.js";

export const toggleArchiveListParamsSchema = z.object({ slug: slugSchema });

export type ToggleArchiveListParams = z.infer<
  typeof toggleArchiveListParamsSchema
>;

export const toggleArchiveListResponseSchemas = {
  200: z.object({
    data: z.object({
      archivedAt: z.iso.datetime().optional(),
      status: listSchema.shape.status,
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
