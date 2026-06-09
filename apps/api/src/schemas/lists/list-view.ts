import { listViewSchema } from "@workspace/shared/schemas/lists/views/list-view.js";
import { ObjectId } from "mongodb";
import { z } from "zod";

export const listViewWithObjectIdsSchema = listViewSchema.extend({
  _id: z.instanceof(ObjectId).optional(),
  ip: z.union([z.ipv4(), z.ipv6()]),
  listId: z.instanceof(ObjectId),
  viewedAt: z.date(),
});

export type ListViewWithObjectIds = z.infer<typeof listViewWithObjectIdsSchema>;
