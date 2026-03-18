import { z } from "zod";

import { objectIdSchema } from "@/schemas/object-id.js";
import { toolCommentReactionSchema } from "@/schemas/tools/comments/tool-comment-reaction.js";
import { toolCommentSchema } from "@/schemas/tools/comments/tool-comment.js";
import { toolReactionSchema } from "@/schemas/tools/reactions/tool-reaction.js";
import { toolSchema } from "@/schemas/tools/tool.js";

import { userBookmarkSchema } from "../bookmarks/user-bookmark.js";
import { userSchema } from "../user.js";

export const userRecoveryPackageSchema = z.object({
  format: z.literal("grepedia-recovery/v1"),
  payload: z.object({
    app: z.literal("grepedia"),
    data: z.object({
      bookmarks: z.array(userBookmarkSchema),
      commentReactions: z.array(toolCommentReactionSchema),
      comments: z.array(toolCommentSchema),
      toolReactions: z.array(toolReactionSchema),
      tools: z.array(toolSchema),
      user: userSchema,
    }),
    expiresAt: z.iso.datetime(),
    exportId: z.uuidv4(),
    issuedAt: z.iso.datetime(),
    userId: objectIdSchema,
    version: z.literal(1),
  }),
  proof: z.object({
    alg: z.literal("HS256"),
    kid: z.string(),
    sig: z.string(),
  }),
});

export type UserRecoveryPackage = z.infer<typeof userRecoveryPackageSchema>;
