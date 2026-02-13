import { z } from "zod";

export const toolReactionSchema = z.object({
  _id: z.string(),
  created_at: z.iso.datetime(),
  toolId: z.string(),
  updated_at: z.iso.datetime(),
  userId: z.string(),
  value: z.union([z.literal(1), z.literal(-1)]),
});

export type ToolReaction = z.infer<typeof toolReactionSchema>;
