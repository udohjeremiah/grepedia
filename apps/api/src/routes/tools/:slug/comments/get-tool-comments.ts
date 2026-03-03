import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { objectIdSchema } from "@workspace/shared/schemas/object-id-schema";
import {
  getToolCommentsParamsSchema,
  getToolCommentsQueryStringSchema,
  getToolCommentsResponseSchemas,
} from "@workspace/shared/schemas/tools/get-tool-comments";
import { ObjectId } from "mongodb";
import { z } from "zod";

import {
  decodeCursor,
  encodeCursor,
  InvalidCursorError,
} from "@/utils/cursor.js";
import { serializeMongoTypes } from "@/utils/serialize-mongo-types.js";

const commentsCursorSchema = z.object({
  createdAt: z.iso.datetime(),
  id: objectIdSchema,
});

type CommentsCursor = z.infer<typeof commentsCursorSchema>;

const getToolComments: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      if (!request.user) throw new Error("User not authenticated");

      const { slug } = request.params;
      const { cursor, limit = 20 } = request.query;

      const tools = fastify.getToolCollection();
      const comments = fastify.getToolCommentCollection();
      const commentReactions = fastify.getToolCommentReactionCollection();
      const users = fastify.getUserCollection();

      const tool = await tools.findOne({ slug }, { projection: { _id: 1 } });

      if (!tool) {
        return reply.code(404).send({
          message: "Tool not found",
          success: false,
        });
      }

      let decodedCursor: CommentsCursor | undefined;
      try {
        decodedCursor = decodeCursor(cursor, commentsCursorSchema);
      } catch (error) {
        if (error instanceof InvalidCursorError) {
          return reply.code(400).send({
            message: "Invalid cursor",
            success: false,
          });
        }
        throw error;
      }

      const toolComments = await comments
        .find(
          decodedCursor
            ? {
                $and: [
                  {
                    parentCommentId: { $exists: false },
                    toolId: tool._id,
                  },
                  {
                    $or: [
                      {
                        createdAt: { $lt: new Date(decodedCursor.createdAt) },
                      },
                      {
                        _id: {
                          $lt: ObjectId.createFromHexString(decodedCursor.id),
                        },
                        createdAt: new Date(decodedCursor.createdAt),
                      },
                    ],
                  },
                ],
              }
            : {
                parentCommentId: { $exists: false },
                toolId: tool._id,
              },
        )
        // eslint-disable-next-line unicorn/no-array-sort, perfectionist/sort-objects
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit)
        .toArray();

      const userIds = [
        ...new Set(
          toolComments
            .map((comment) => comment.userId.toHexString())
            .filter((id) => id.length > 0),
        ),
      ].map((id) => ObjectId.createFromHexString(id));

      const commentUsers =
        userIds.length > 0
          ? await users
              .find(
                { _id: { $in: userIds } },
                { projection: { _id: 1, image: 1, name: 1, username: 1 } },
              )
              .toArray()
          : [];

      const userById = new Map(
        commentUsers.map((user) => [user._id.toHexString(), user]),
      );

      const currentUserId = ObjectId.createFromHexString(request.user.id);
      const commentIds = toolComments.map((comment) => comment._id);
      const currentUserReactions =
        commentIds.length > 0
          ? await commentReactions
              .find(
                { commentId: { $in: commentIds }, userId: currentUserId },
                { projection: { commentId: 1, value: 1 } },
              )
              .toArray()
          : [];

      const reactionByCommentId = new Map(
        currentUserReactions.map((reaction) => [
          reaction.commentId.toHexString(),
          reaction.value,
        ]),
      );

      const commentsResponse = toolComments.map((comment) => {
        const user = userById.get(comment.userId.toHexString());

        return serializeMongoTypes({
          _id: comment._id,
          content: comment.content,
          createdAt: comment.createdAt,
          parentCommentId: comment.parentCommentId,
          replyCount: comment.replyCount ?? 0,
          stats: comment.stats,
          updatedAt: comment.updatedAt,
          user: {
            _id: comment.userId,
            image: user?.image,
            name: user?.name ?? "Deleted user",
            username: user?.username ?? "deleted-user",
          },
          viewerReaction: reactionByCommentId.get(comment._id.toHexString()),
        });
      });

      let nextCursor: string | undefined;
      const lastComment = toolComments.at(-1);

      if (lastComment && toolComments.length === limit) {
        nextCursor = encodeCursor({
          createdAt: lastComment.createdAt.toISOString(),
          id: lastComment._id.toHexString(),
        });
      }

      return reply.code(200).send({
        data: {
          comments: serializeMongoTypes(commentsResponse),
          nextCursor,
        },
        message: "Tool comments retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    onRequest: [fastify.requireUser],
    schema: {
      params: getToolCommentsParamsSchema,
      querystring: getToolCommentsQueryStringSchema,
      response: getToolCommentsResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Tools"],
    },
    url: "/",
  });
};

export default getToolComments;
