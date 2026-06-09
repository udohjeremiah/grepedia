import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  setToolCommentReactionBodySchema,
  setToolCommentReactionParamsSchema,
  setToolCommentReactionResponseSchemas,
} from "@workspace/shared/schemas/tools/comments/set-tool-comment-reaction";
import { type Collection, ObjectId } from "mongodb";

import type { ToolCommentReactionWithObjectIds } from "@/schemas/tools/tool-comment-reaction.js";

type ExistingReaction = { _id: ObjectId };
type ReactionAction = "delete" | "insert" | "update";
type ReactionValue = -1 | 1;

async function applyReactionAction({
  action,
  commentId,
  commentReactions,
  existingReaction,
  userId,
  value,
}: {
  action: ReactionAction;
  commentId: ObjectId;
  commentReactions: Collection<ToolCommentReactionWithObjectIds>;
  existingReaction?: ExistingReaction;
  userId: ObjectId;
  value: ReactionValue;
}) {
  if (action === "insert") {
    const now = new Date();

    const insertResult = await commentReactions.insertOne({
      commentId,
      createdAt: now,
      updatedAt: now,
      userId,
      value,
    });

    return insertResult.acknowledged;
  }

  if (action === "delete" && existingReaction) {
    const deleteResult = await commentReactions.deleteOne({
      _id: existingReaction._id,
    });

    return deleteResult.acknowledged;
  }

  if (action === "update" && existingReaction) {
    const updateReactionResult = await commentReactions.updateOne(
      { _id: existingReaction._id },
      { $set: { updatedAt: new Date(), value } },
    );

    return updateReactionResult.acknowledged;
  }

  return false;
}

function getCommentStatsDelta(action: ReactionAction, value: ReactionValue) {
  if (action === "insert") {
    return value === 1 ? { "stats.upvotes": 1 } : { "stats.downvotes": 1 };
  }

  if (action === "delete") {
    return value === 1 ? { "stats.upvotes": -1 } : { "stats.downvotes": -1 };
  }

  return value === 1
    ? { "stats.downvotes": -1, "stats.upvotes": 1 }
    : { "stats.downvotes": 1, "stats.upvotes": -1 };
}

function resolveReactionAction(
  existingValue: ReactionValue | undefined,
  nextValue: ReactionValue,
): { action: ReactionAction; reaction: ReactionValue | undefined } {
  if (existingValue === undefined) {
    return { action: "insert", reaction: nextValue };
  }

  if (existingValue === nextValue) {
    return { action: "delete", reaction: undefined };
  }

  return { action: "update", reaction: nextValue };
}

const setToolCommentReaction: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      if (!request.user) throw new Error("User not authenticated");

      const { commentId, slug } = request.params;
      const { value } = request.body;

      const tools = fastify.db.tools;
      const comments = fastify.db.toolComments;
      const commentReactions = fastify.db.toolCommentReactions;

      const tool = await tools.findOne({ slug }, { projection: { _id: 1 } });

      if (!tool) {
        return reply.code(404).send({
          message: "Tool not found",
          success: false,
        });
      }

      const commentObjectId = ObjectId.createFromHexString(commentId);
      const comment = await comments.findOne({
        _id: commentObjectId,
        toolId: tool._id,
      });

      if (!comment) {
        return reply.code(404).send({
          message: "Comment not found",
          success: false,
        });
      }

      const userId = ObjectId.createFromHexString(request.user.id);
      const existingReaction = await commentReactions.findOne({
        commentId: commentObjectId,
        userId,
      });

      const { action, reaction } = resolveReactionAction(
        existingReaction?.value,
        value,
      );

      const reactionResult = await applyReactionAction({
        action,
        commentId: commentObjectId,
        commentReactions,
        existingReaction: existingReaction
          ? { _id: existingReaction._id }
          : undefined,
        userId,
        value,
      });

      if (!reactionResult) {
        return reply.code(500).send({
          message: "Internal server error",
          success: false,
        });
      }

      const updateCommentResult = await comments.updateOne(
        { _id: commentObjectId },
        { $inc: getCommentStatsDelta(action, value) },
      );

      if (!updateCommentResult.acknowledged) {
        return reply.code(500).send({
          message: "Internal server error",
          success: false,
        });
      }

      const updatedComment = await comments.findOne(
        { _id: commentObjectId },
        { projection: { "stats.downvotes": 1, "stats.upvotes": 1 } },
      );

      if (!updatedComment) {
        return reply.code(404).send({
          message: "Comment not found",
          success: false,
        });
      }

      return reply.code(200).send({
        data: {
          commentId,
          reaction,
          stats: {
            downvotes: updatedComment.stats.downvotes,
            upvotes: updatedComment.stats.upvotes,
          },
        },
        message: "Comment reaction updated successfully",
        success: true,
      });
    },
    method: "POST",
    onRequest: [fastify.requireStatus("active")],
    schema: {
      body: setToolCommentReactionBodySchema,
      params: setToolCommentReactionParamsSchema,
      response: setToolCommentReactionResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Tools"],
    },
    url: "/reaction",
  });
};

export default setToolCommentReaction;
