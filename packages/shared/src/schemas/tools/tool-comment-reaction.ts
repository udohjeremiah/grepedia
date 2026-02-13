import { z } from "zod";

export const toolCommentReactionSchema = z.object({
  _id: z.string(),
  commentId: z.string(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  userId: z.string(),
  value: z.union([z.literal(1), z.literal(-1)]),
});

export type ToolCommentReaction = z.infer<typeof toolCommentReactionSchema>;
