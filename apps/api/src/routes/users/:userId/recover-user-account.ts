import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { Collection } from "mongodb";

import { canonicalStringify } from "@workspace/shared/canonical-stringify";
import {
  recoverUserAccountBodySchema,
  recoverUserAccountParamsSchema,
  recoverUserAccountResponseSchemas,
} from "@workspace/shared/schemas/users/recovery-package/recover-user-account";
import { ObjectId } from "mongodb";
import { createHmac, timingSafeEqual } from "node:crypto";

import type { ToolCommentReactionWithObjectIds } from "@/schemas/tools/tool-comment-reaction.js";
import type { ToolReactionWithObjectIds } from "@/schemas/tools/tool-reaction.js";
import type { UserBookmarkWithObjectIds } from "@/schemas/users/user-bookmark.js";

const recoverUserAccount: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { userId } = request.params;
      const { recoveryPackage } = request.body;

      if (recoveryPackage.format !== "grepedia-recovery/v1") {
        return reply.code(400).send({
          message: "Unsupported recovery package format",
          success: false,
        });
      }

      const expiresAt = new Date(recoveryPackage.payload.expiresAt);
      if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
        return reply.code(400).send({
          message: "Recovery package has expired",
          success: false,
        });
      }

      const expectedSignature = createHmac(
        "sha256",
        fastify.env.USER_DATA_EXPORT_SIGNING_SECRET,
      )
        .update(canonicalStringify(recoveryPackage.payload))
        .digest("base64url");

      const expectedBuffer = Buffer.from(expectedSignature);
      const providedBuffer = Buffer.from(recoveryPackage.proof.sig);
      const signatureMatches =
        expectedBuffer.length === providedBuffer.length &&
        timingSafeEqual(expectedBuffer, providedBuffer);

      if (!signatureMatches) {
        return reply.code(400).send({
          message: "Invalid recovery package signature",
          success: false,
        });
      }

      if (!ObjectId.isValid(recoveryPackage.payload.userId)) {
        return reply.code(400).send({
          message: "Invalid recovery package user id",
          success: false,
        });
      }

      const currentUserId = ObjectId.createFromHexString(userId);
      const previousUserId = ObjectId.createFromHexString(
        recoveryPackage.payload.userId,
      );

      const userBookmarks = fastify.getUserBookmarkCollection();
      const tools = fastify.getToolCollection();
      const toolReactions = fastify.getToolReactionCollection();
      const toolComments = fastify.getToolCommentCollection();
      const toolCommentReactions = fastify.getToolCommentReactionCollection();
      const moderationCases = fastify.getModerationCaseCollection();

      const writeResults = await Promise.all([
        tools.updateMany(
          { addedBy: previousUserId },
          { $set: { addedBy: currentUserId } },
        ),
        tools.updateMany(
          { owner: previousUserId },
          { $set: { owner: currentUserId } },
        ),
        tools.updateMany(
          { updatedBy: previousUserId },
          { $set: { updatedBy: currentUserId } },
        ),
        toolComments.updateMany(
          { userId: previousUserId },
          { $set: { userId: currentUserId } },
        ),
        relinkToolReactions({
          currentUserId,
          previousUserId,
          toolReactions,
        }),
        relinkCommentReactions({
          commentReactions: toolCommentReactions,
          currentUserId,
          previousUserId,
        }),
        moderationCases.updateMany(
          { createdBy: previousUserId },
          { $set: { createdBy: currentUserId } },
        ),
        moderationCases.updateMany(
          { userId: previousUserId },
          { $set: { userId: currentUserId } },
        ),
        moderationCases.updateMany(
          { "resolution.resolvedBy": previousUserId },
          { $set: { "resolution.resolvedBy": currentUserId } },
        ),
        restoreBookmarks({
          bookmarks: recoveryPackage.payload.data.bookmarks,
          currentUserId,
          userBookmarks,
        }),
      ]).catch((error) => {
        fastify.log.error("Failed to recover user account:", error);
        return reply.code(500).send({
          message: "Internal server error",
          success: false,
        });
      });

      const [
        toolsAddedByResult,
        toolsOwnedResult,
        toolsUpdatedByResult,
        commentsResult,
        toolReactionsResult,
        commentReactionsResult,
        moderationCreatedByResult,
        moderationUserIdResult,
        moderationResolvedByResult,
        bookmarksResult,
      ] = writeResults;

      if (
        !isMongoWriteAcknowledged(toolsAddedByResult) ||
        !isMongoWriteAcknowledged(toolsOwnedResult) ||
        !isMongoWriteAcknowledged(toolsUpdatedByResult) ||
        !isMongoWriteAcknowledged(commentsResult) ||
        !isMongoWriteAcknowledged(toolReactionsResult) ||
        !isMongoWriteAcknowledged(commentReactionsResult) ||
        !isMongoWriteAcknowledged(moderationCreatedByResult) ||
        !isMongoWriteAcknowledged(moderationUserIdResult) ||
        !isMongoWriteAcknowledged(moderationResolvedByResult) ||
        !isMongoWriteAcknowledged(bookmarksResult)
      ) {
        fastify.log.error("Failed to recover user account");
        return reply.code(500).send({
          message: "Internal server error",
          success: false,
        });
      }

      const relinked = {
        bookmarks: bookmarksResult.upsertedCount,
        commentReactions: commentReactionsResult.modifiedCount,
        comments: commentsResult.modifiedCount,
        moderationCases:
          moderationCreatedByResult.modifiedCount +
          moderationUserIdResult.modifiedCount +
          moderationResolvedByResult.modifiedCount,
        toolReactions: toolReactionsResult.modifiedCount,
        tools:
          toolsAddedByResult.modifiedCount +
          toolsOwnedResult.modifiedCount +
          toolsUpdatedByResult.modifiedCount,
      };

      return reply.code(200).send({
        data: { relinked },
        message: "Account recovery completed",
        success: true,
      });
    },
    method: "POST",
    onRequest: [fastify.requireUserId()],
    schema: {
      body: recoverUserAccountBodySchema,
      params: recoverUserAccountParamsSchema,
      response: recoverUserAccountResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Users"],
    },
    url: "/recover-account",
  });
};

export default recoverUserAccount;

function isMongoWriteAcknowledged(result: unknown) {
  if (typeof result !== "object" || result === null) {
    return false;
  }

  if (!("acknowledged" in result)) {
    return true;
  }

  return result.acknowledged === true;
}

async function relinkCommentReactions({
  commentReactions,
  currentUserId,
  previousUserId,
}: {
  commentReactions: Collection<ToolCommentReactionWithObjectIds>;
  currentUserId: ObjectId;
  previousUserId: ObjectId;
}) {
  const oldReactions = await commentReactions
    .find({ userId: previousUserId }, { projection: { commentId: 1 } })
    .toArray();

  const oldCommentIds = oldReactions.map((reaction) => reaction.commentId);
  if (oldCommentIds.length === 0) {
    return commentReactions.updateMany(
      { userId: previousUserId },
      { $set: { userId: currentUserId } },
    );
  }

  const conflicts = await commentReactions
    .find(
      { commentId: { $in: oldCommentIds }, userId: currentUserId },
      { projection: { commentId: 1 } },
    )
    .toArray();

  const conflictCommentIds = conflicts.map((reaction) => reaction.commentId);
  if (conflictCommentIds.length > 0) {
    const deleteResult = await commentReactions.deleteMany({
      commentId: { $in: conflictCommentIds },
      userId: previousUserId,
    });

    if (!deleteResult.acknowledged) {
      throw new Error("Failed to delete conflicting comment reactions");
    }
  }

  return commentReactions.updateMany(
    { userId: previousUserId },
    { $set: { userId: currentUserId } },
  );
}

async function relinkToolReactions({
  currentUserId,
  previousUserId,
  toolReactions,
}: {
  currentUserId: ObjectId;
  previousUserId: ObjectId;
  toolReactions: Collection<ToolReactionWithObjectIds>;
}) {
  const oldReactions = await toolReactions
    .find({ userId: previousUserId }, { projection: { toolId: 1 } })
    .toArray();

  const oldToolIds = oldReactions.map((reaction) => reaction.toolId);
  if (oldToolIds.length === 0) {
    return toolReactions.updateMany(
      { userId: previousUserId },
      { $set: { userId: currentUserId } },
    );
  }

  const conflicts = await toolReactions
    .find(
      { toolId: { $in: oldToolIds }, userId: currentUserId },
      { projection: { toolId: 1 } },
    )
    .toArray();

  const conflictToolIds = conflicts.map((reaction) => reaction.toolId);
  if (conflictToolIds.length > 0) {
    const deleteResult = await toolReactions.deleteMany({
      toolId: { $in: conflictToolIds },
      userId: previousUserId,
    });

    if (!deleteResult.acknowledged) {
      throw new Error("Failed to delete conflicting tool reactions");
    }
  }

  return toolReactions.updateMany(
    { userId: previousUserId },
    { $set: { userId: currentUserId } },
  );
}

async function restoreBookmarks({
  bookmarks,
  currentUserId,
  userBookmarks,
}: {
  bookmarks: Array<{
    createdAt: string;
    toolId: string;
  }>;
  currentUserId: ObjectId;
  userBookmarks: Collection<UserBookmarkWithObjectIds>;
}) {
  if (bookmarks.length === 0) {
    return { acknowledged: true, upsertedCount: 0 };
  }

  const operations = bookmarks.map((bookmark) => {
    const toolId = ObjectId.createFromHexString(bookmark.toolId);
    return {
      updateOne: {
        filter: { toolId, userId: currentUserId },
        update: {
          $setOnInsert: {
            createdAt: new Date(bookmark.createdAt),
            toolId,
            userId: currentUserId,
          },
        },
        upsert: true,
      },
    };
  });

  const bulkWriteResult = await userBookmarks.bulkWrite(operations, {
    ordered: false,
  });

  return bulkWriteResult;
}
