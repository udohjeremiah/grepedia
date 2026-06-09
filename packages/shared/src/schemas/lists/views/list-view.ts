import { z } from "zod";

import { objectIdSchema } from "@/schemas/object-id.js";

export const listViewSchema = z.object({
  _id: objectIdSchema,
  ip: z.union([z.ipv4(), z.ipv6()]),
  listId: objectIdSchema,
  viewedAt: z.iso.datetime(),
});

export type ListView = z.infer<typeof listViewSchema>;
