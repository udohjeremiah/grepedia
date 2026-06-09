import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { objectIdSchema } from "@/schemas/object-id.js";

export const moderatorUpdateCommentBodySchema = z.object({
  commentId: objectIdSchema,
  status: z.enum(["active", "flagged"]),
});

export type ModeratorUpdateCommentBody = z.infer<
  typeof moderatorUpdateCommentBodySchema
>;

export const moderatorUpdateCommentResponseSchemas = {
  200: z.object({
    data: z.object({
      comment: z.object({
        _id: objectIdSchema,
        status: z.enum(["active", "flagged"]),
      }),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
