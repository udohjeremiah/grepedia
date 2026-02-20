import { z } from "zod";

import { objectIdSchema } from "../object-id-schema.js";

export const toolCommentSchema = z.object({
  _id: objectIdSchema,
  content: z.string(),
  createdAt: z.iso.datetime(),
  stats: z.object({
    downvotes: z.int().min(0),
    upvotes: z.int().min(0),
  }),
  toolId: objectIdSchema,
  updatedAt: z.string(),
  userId: objectIdSchema,
});

export type ToolComment = z.infer<typeof toolCommentSchema>;
