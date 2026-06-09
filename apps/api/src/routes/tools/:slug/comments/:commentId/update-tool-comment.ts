import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  updateToolCommentBodySchema,
  updateToolCommentParamsSchema,
  updateToolCommentResponseSchemas,
} from "@workspace/shared/schemas/tools/comments/update-tool-comment";
import { ObjectId } from "mongodb";

import { serializeMongoTypes } from "@/utils/serialize-mongo-types.js";

const updateToolComment: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      if (!request.user) throw new Error("User not authenticated");

      const { commentId, slug } = request.params;
      const { content } = request.body;

      const comments = fastify.db.toolComments;
      const tools = fastify.db.tools;
      const users = fastify.db.users;

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
          message: "You can only edit your own comments",
          success: false,
        });
      }

      const updateResult = await comments.findOneAndUpdate(
        { _id: commentObjectId },
        { $set: { content, updatedAt: new Date() } },
        { returnDocument: "after" },
      );

      if (!updateResult) {
        return reply.code(500).send({
          message: "Internal server error",
          success: false,
        });
      }

      const author = await users.findOne(
        { _id: updateResult.userId },
        { projection: { _id: 1, image: 1, name: 1, username: 1 } },
      );

      return reply.code(200).send({
        data: {
          comment: serializeMongoTypes({
            _id: updateResult._id,
            content: updateResult.content,
            createdAt: updateResult.createdAt,
            parentCommentId: updateResult.parentCommentId,
            replyCount: updateResult.replyCount ?? 0,
            stats: updateResult.stats,
            updatedAt: updateResult.updatedAt,
            user: {
              _id: updateResult.userId,
              image: author?.image,
              name: author?.name ?? "Deleted user",
              username: author?.username ?? "deleted-user",
            },
            viewerReaction: undefined,
          }),
        },
        message: "Comment updated successfully",
        success: true,
      });
    },
    method: "PATCH",
    onRequest: [fastify.requireUser],
    schema: {
      body: updateToolCommentBodySchema,
      params: updateToolCommentParamsSchema,
      response: updateToolCommentResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Tools"],
    },
    url: "/",
  });
};

export default updateToolComment;
