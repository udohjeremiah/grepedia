import { z } from "zod";

import { defaultResponse } from "../default-response.js";
import { toolCommentReactionSchema } from "../tools/tool-comment-reaction.js";
import { toolCommentSchema } from "../tools/tool-comment.js";
import { toolReactionSchema } from "../tools/tool-reaction.js";
import { toolSchema } from "../tools/tool.js";
import { userBookmarkSchema } from "./user-bookmark.js";
import { userSchema } from "./user.js";

export const getUserRecoveryPackageParamsSchema = z.object({
  userId: z.string(),
});

export type GetUserRecoveryPackageParams = z.infer<
  typeof getUserRecoveryPackageParamsSchema
>;

export const userAccountExportSnapshotSchema = z.object({
  bookmarks: z.array(userBookmarkSchema),
  commentReactions: z.array(toolCommentReactionSchema),
  comments: z.array(toolCommentSchema),
  toolReactions: z.array(toolReactionSchema),
  tools: z.array(toolSchema),
  user: userSchema,
});

export const userAccountExportProofSchema = z.object({
  alg: z.literal("HS256"),
  kid: z.string(),
  sig: z.string(),
});

export const userAccountExportPackageSchema = z.object({
  format: z.literal("grepedia-recovery/v1"),
  payload: z.object({
    app: z.literal("grepedia"),
    data: userAccountExportSnapshotSchema,
    expiresAt: z.iso.datetime(),
    exportId: z.string(),
    issuedAt: z.iso.datetime(),
    userId: z.string(),
    version: z.literal(1),
  }),
  proof: userAccountExportProofSchema,
});

export const getUserRecoveryPackageResponseSchemas = {
  200: z.object({
    data: z.object({
      recoveryPackage: userAccountExportPackageSchema,
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
