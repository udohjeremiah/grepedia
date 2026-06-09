import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { objectIdSchema } from "@/schemas/object-id.js";
import { slugSchema } from "@/schemas/slug.js";

export const deleteListParamsSchema = z.object({ slug: slugSchema });

export type DeleteListParams = z.infer<typeof deleteListParamsSchema>;

export const deleteListResponseSchemas = {
  200: z.object({
    data: z.object({ listId: objectIdSchema }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
