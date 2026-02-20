import { z } from "zod";

import { objectIdSchema } from "../object-id-schema.js";

export const toolReactionSchema = z.object({
  _id: objectIdSchema,
  createdAt: z.iso.datetime(),
  toolId: objectIdSchema,
  updatedAt: z.iso.datetime(),
  userId: objectIdSchema,
  value: z.union([z.literal(1), z.literal(-1)]),
});

export type ToolReaction = z.infer<typeof toolReactionSchema>;
