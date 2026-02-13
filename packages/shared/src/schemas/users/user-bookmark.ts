import { z } from "zod";

export const userBookmarkSchema = z.object({
  _id: z.string(),
  created_at: z.iso.datetime(),
  toolId: z.string(),
  userId: z.string(),
});

export type UserBookmark = z.infer<typeof userBookmarkSchema>;
