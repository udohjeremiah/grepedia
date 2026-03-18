import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { discordUrlSchema } from "@/schemas/discord-url.js";
import { imageSchema } from "@/schemas/image.js";
import { objectIdSchema } from "@/schemas/object-id.js";
import { slugSchema } from "@/schemas/slug.js";
import { toolRevisionSnapshotSchema } from "@/schemas/tools/revisions/tool-revision.js";

const requesterSchema = z.object({
  _id: objectIdSchema,
  image: imageSchema.optional(),
  name: z.string(),
  username: z.string(),
});

export const getToolProposalsParamsSchema = z.object({
  slug: slugSchema,
});

export type GetToolProposalsParams = z.infer<
  typeof getToolProposalsParamsSchema
>;

export const getToolProposalsResponseSchemas = {
  200: z.object({
    data: z.object({
      claimCase: z
        .object({
          _id: objectIdSchema,
          discussionUrl: discordUrlSchema,
          reason: z.string(),
          requestedAt: z.iso.datetime(),
          requester: requesterSchema,
          status: z.enum(["open", "under_review"]),
        })
        .optional(),
      updateCase: z
        .object({
          _id: objectIdSchema,
          changes: toolRevisionSnapshotSchema,
          discussionUrl: discordUrlSchema,
          requestedAt: z.iso.datetime(),
          requester: requesterSchema,
          status: z.enum(["open", "under_review"]),
          summary: z.string(),
          title: z.string(),
        })
        .optional(),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
