import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  moderatorUpdateCommentBodySchema,
  moderatorUpdateCommentResponseSchemas,
} from "@workspace/shared/schemas/moderation/moderator-update-comment";
import { ObjectId } from "mongodb";

const updateComment: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { commentId, status } = request.body;

      const comments = fastify.db.toolComments;
      const tools = fastify.db.tools;

      const commentObjectId = ObjectId.createFromHexString(commentId);
      const comment = await comments.findOne({ _id: commentObjectId });

      if (!comment) {
        return reply.code(404).send({
          message: "Comment not found",
          success: false,
        });
      }

      const previousStatus = comment.status;
      const now = new Date();

      const updateResult = await comments.findOneAndUpdate(
        { _id: commentObjectId },
        { $set: { status, updatedAt: now } },
        { projection: { _id: 1, status: 1 }, returnDocument: "after" },
      );

      if (!updateResult) {
        return reply.code(500).send({
          message: "Internal server error",
          success: false,
        });
      }

      if (previousStatus !== status) {
        const commentsDelta =
          previousStatus === "active" && status === "flagged"
            ? -1
            : // eslint-disable-next-line sonarjs/no-nested-conditional
              previousStatus === "flagged" && status === "active"
              ? 1
              : 0;

        if (commentsDelta !== 0) {
          await tools.updateOne(
            { _id: comment.toolId },
            { $inc: { "stats.comments": commentsDelta } },
          );
        }
      }

      return reply.code(200).send({
        data: {
          comment: {
            _id: updateResult._id.toHexString(),
            status: updateResult.status,
          },
        },
        message: "Comment updated successfully",
        success: true,
      });
    },
    method: "PATCH",
    onRequest: [fastify.requireModerator],
    schema: {
      body: moderatorUpdateCommentBodySchema,
      response: moderatorUpdateCommentResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Moderation"],
    },
    url: "/update",
  });
};

export default updateComment;
