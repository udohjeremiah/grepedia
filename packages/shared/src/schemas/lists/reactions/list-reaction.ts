import { z } from "zod";

import { objectIdSchema } from "@/schemas/object-id.js";

export const listReactionSchema = z.object({
  _id: objectIdSchema,
  createdAt: z.iso.datetime(),
  listId: objectIdSchema,
  updatedAt: z.iso.datetime(),
  userId: objectIdSchema,
  value: z.union([z.literal(1), z.literal(-1)]),
});

export type ListReaction = z.infer<typeof listReactionSchema>;
