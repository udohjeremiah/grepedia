import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  deleteToolCommentParamsSchema,
  deleteToolCommentResponseSchemas,
} from "@workspace/shared/schemas/tools/comments/delete-tool-comment";
import { ObjectId } from "mongodb";

const deleteToolComment: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      if (!request.user) throw new Error("User not authenticated");

      const { commentId, slug } = request.params;

      const comments = fastify.getToolCommentCollection();
      const commentReactions = fastify.getToolCommentReactionCollection();
      const tools = fastify.getToolCollection();

      const tool = await tools.findOne({ slug }, { projection: { _id: 1 } });

      if (!tool) {
        return reply.code(404).send({
          message: "Tool not found",
          success: false,
        });
      }

      const commentObjectId = ObjectId.createFromHexString(commentId);
      const userObjectId = ObjectId.createFromHexString(request.user.id);

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

      if (comment.userId.toHexString() !== userObjectId.toHexString()) {
        return reply.code(403).send({
          message: "You can only delete your own comments",
          success: false,
        });
      }

      if (comment.replyCount > 0) {
        return reply.code(409).send({
          message: "Cannot delete a parent comment with replies",
          success: false,
        });
      }

      const deleteCommentResult = await comments.deleteOne({
        _id: commentObjectId,
        toolId: tool._id,
      });

      if (!deleteCommentResult.acknowledged) {
        return reply.code(500).send({
          message: "Internal server error",
          success: false,
        });
      }

      if (deleteCommentResult.deletedCount === 0) {
        return reply.code(404).send({
          message: "Comment not found",
          success: false,
        });
      }

      const deleteReactionResult = await commentReactions.deleteMany({
        commentId: commentObjectId,
      });

      if (!deleteReactionResult.acknowledged) {
        return reply.code(500).send({
          message: "Internal server error",
          success: false,
        });
      }

      if (comment.parentCommentId) {
        const updateParentResult = await comments.updateOne(
          { _id: comment.parentCommentId },
          { $inc: { replyCount: -1 } },
        );

        if (!updateParentResult.acknowledged) {
          return reply.code(500).send({
            message: "Internal server error",
            success: false,
          });
        }
      }

      const updateToolResult = await tools.updateOne(
        { _id: tool._id },
        { $inc: { "stats.comments": -1 } },
      );

      if (!updateToolResult.acknowledged) {
        return reply.code(500).send({
          message: "Internal server error",
          success: false,
        });
      }

      return reply.code(200).send({
        data: { commentId },
        message: "Comment deleted successfully",
        success: true,
      });
    },
    method: "DELETE",
    onRequest: [fastify.requireUser],
    schema: {
      params: deleteToolCommentParamsSchema,
      response: deleteToolCommentResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Tools"],
    },
    url: "/",
  });
};

export default deleteToolComment;
