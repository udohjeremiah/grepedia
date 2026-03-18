import { z } from "zod";

import { objectIdSchema } from "@/schemas/object-id.js";

export const userBookmarkSchema = z.object({
  _id: objectIdSchema,
  createdAt: z.iso.datetime(),
  toolId: objectIdSchema,
  userId: objectIdSchema,
});

export type UserBookmark = z.infer<typeof userBookmarkSchema>;
