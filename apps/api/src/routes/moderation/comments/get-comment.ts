import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  moderatorGetCommentQueryStringSchema,
  moderatorGetCommentResponseSchemas,
} from "@workspace/shared/schemas/moderation/moderator-get-comment";
import { ObjectId } from "mongodb";

const getComment: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { commentId } = request.query;

      const comments = fastify.db.toolComments;
      const tools = fastify.db.tools;
      const users = fastify.db.users;

      const comment = await comments.findOne({
        _id: ObjectId.createFromHexString(commentId),
      });

      if (!comment) {
        return reply.code(404).send({
          message: "Comment not found",
          success: false,
        });
      }

      const [tool, commentUser] = await Promise.all([
        tools.findOne({ _id: comment.toolId }, { projection: { slug: 1 } }),
        users.findOne(
          { _id: comment.userId },
          { projection: { name: 1, username: 1 } },
        ),
      ]);

      if (!tool) {
        return reply.code(404).send({
          message: "Tool not found",
          success: false,
        });
      }

      return reply.code(200).send({
        data: {
          comment: {
            _id: comment._id.toHexString(),
            content: comment.content,
            createdAt: comment.createdAt.toISOString(),
            parentCommentId: comment.parentCommentId?.toHexString(),
            replyCount: comment.replyCount,
            status: comment.status,
            toolSlug: tool.slug,
            updatedAt: comment.updatedAt.toISOString(),
            user: {
              name: commentUser?.name ?? "Deleted user",
              username: commentUser?.username ?? "deleted-user",
            },
          },
        },
        message: "Comment retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    onRequest: [fastify.requireModerator],
    schema: {
      querystring: moderatorGetCommentQueryStringSchema,
      response: moderatorGetCommentResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Moderation"],
    },
    url: "/lookup",
  });
};

export default getComment;
