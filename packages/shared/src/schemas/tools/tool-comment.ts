import { z } from "zod";

export const toolCommentSchema = z.object({
  _id: z.string(),
  content: z.string(),
  created_at: z.iso.datetime(),
  stats: z.object({
    downvotes: z.int().min(0),
    upvotes: z.int().min(0),
  }),
  toolId: z.string(),
  updated_at: z.string(),
  userId: z.string(),
});

export type ToolComment = z.infer<typeof toolCommentSchema>;
