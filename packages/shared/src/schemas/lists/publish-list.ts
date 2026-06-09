import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { objectIdSchema } from "@/schemas/object-id.js";
import { slugSchema } from "@/schemas/slug.js";

export const publishListParamsSchema = z.object({ slug: slugSchema });

export type PublishListParams = z.infer<typeof publishListParamsSchema>;

export const publishListResponseSchemas = {
  200: z.object({
    data: z.object({
      listId: objectIdSchema,
      listSlug: slugSchema,
      publishedAt: z.iso.datetime(),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
