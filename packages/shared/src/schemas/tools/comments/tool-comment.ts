import { z } from "zod";

import { objectIdSchema } from "@/schemas/object-id.js";

export const toolCommentSchema = z.object({
  _id: objectIdSchema,
  content: z.string(),
  createdAt: z.iso.datetime(),
  parentCommentId: objectIdSchema.optional(),
  replyCount: z.int().min(0),
  stats: z.object({
    downvotes: z.int().min(0),
    upvotes: z.int().min(0),
  }),
  status: z.enum(["active", "flagged"]),
  toolId: objectIdSchema,
  updatedAt: z.iso.datetime(),
  userId: objectIdSchema,
});

export type ToolComment = z.infer<typeof toolCommentSchema>;
