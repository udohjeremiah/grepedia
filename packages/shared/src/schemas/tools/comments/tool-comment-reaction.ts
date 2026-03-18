import { z } from "zod";

import { objectIdSchema } from "@/schemas/object-id.js";

export const toolCommentReactionSchema = z.object({
  _id: objectIdSchema,
  commentId: objectIdSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  userId: objectIdSchema,
  value: z.union([z.literal(1), z.literal(-1)]),
});

export type ToolCommentReaction = z.infer<typeof toolCommentReactionSchema>;
