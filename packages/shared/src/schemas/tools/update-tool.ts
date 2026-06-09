import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { discordUrlSchema } from "@/schemas/discord-url.js";
import { objectIdSchema } from "@/schemas/object-id.js";
import { slugSchema } from "@/schemas/slug.js";

import { toolRevisionSnapshotSchema } from "./revisions/tool-revision.js";

export const updateToolParamsSchema = z.object({
  slug: slugSchema,
});

export type UpdateToolParams = z.infer<typeof updateToolParamsSchema>;

export const updateToolBodySchema = z.object({
  changes: toolRevisionSnapshotSchema,
  discussionUrl: discordUrlSchema,
  summary: z.string().min(20).max(1000),
  title: z.string().min(8).max(50),
});

export type UpdateToolBody = z.infer<typeof updateToolBodySchema>;

export const updateToolResponseSchemas = {
  202: z.object({
    data: z.object({
      caseId: objectIdSchema,
      submittedAt: z.iso.datetime(),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
