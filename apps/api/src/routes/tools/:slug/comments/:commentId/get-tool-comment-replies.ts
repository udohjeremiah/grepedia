import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { objectIdSchema } from "@workspace/shared/schemas/object-id-schema";
import {
  getToolCommentRepliesParamsSchema,
  getToolCommentRepliesQueryStringSchema,
  getToolCommentRepliesResponseSchemas,
} from "@workspace/shared/schemas/tools/get-tool-comment-replies";
import { ObjectId } from "mongodb";
import { z } from "zod";

import {
  decodeCursor,
  encodeCursor,
  InvalidCursorError,
} from "@/utils/cursor.js";
import { serializeMongoTypes } from "@/utils/serialize-mongo-types.js";

const repliesCursorSchema = z.object({
  createdAt: z.iso.datetime(),
  id: objectIdSchema,
});

type RepliesCursor = z.infer<typeof repliesCursorSchema>;

const getToolCommentReplies: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      if (!request.user) throw new Error("User not authenticated");

      const { commentId, slug } = request.params;
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

      const parentCommentId = ObjectId.createFromHexString(commentId);
      const parent = await comments.findOne({
        _id: parentCommentId,
        toolId: tool._id,
      });

      if (!parent) {
        return reply.code(404).send({
          message: "Comment not found",
          success: false,
        });
      }

      let decodedCursor: RepliesCursor | undefined;
      try {
        decodedCursor = decodeCursor(cursor, repliesCursorSchema);
      } catch (error) {
        if (error instanceof InvalidCursorError) {
          return reply.code(400).send({
            message: "Invalid cursor",
            success: false,
          });
        }
        throw error;
      }

      const replies = await comments
        .find(
          decodedCursor
            ? {
                $and: [
                  { parentCommentId, toolId: tool._id },
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
            : { parentCommentId, toolId: tool._id },
        )
        // eslint-disable-next-line perfectionist/sort-objects, unicorn/no-array-sort
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit)
        .toArray();

      const userIds = [
        ...new Set(replies.map((replyItem) => replyItem.userId.toHexString())),
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
      const replyIds = replies.map((replyItem) => replyItem._id);
      const currentUserReactions =
        replyIds.length > 0
          ? await commentReactions
              .find(
                { commentId: { $in: replyIds }, userId: currentUserId },
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

      const repliesResponse = replies.map((replyItem) => {
        const user = userById.get(replyItem.userId.toHexString());

        return serializeMongoTypes({
          _id: replyItem._id,
          content: replyItem.content,
          createdAt: replyItem.createdAt,
          parentCommentId: replyItem.parentCommentId,
          replyCount: replyItem.replyCount ?? 0,
          stats: replyItem.stats,
          updatedAt: replyItem.updatedAt,
          user: {
            _id: replyItem.userId,
            image: user?.image,
            name: user?.name ?? "Deleted user",
            username: user?.username ?? "deleted-user",
          },
          viewerReaction: reactionByCommentId.get(replyItem._id.toHexString()),
        });
      });

      let nextCursor: string | undefined;
      const lastReply = replies.at(-1);

      if (lastReply && replies.length === limit) {
        nextCursor = encodeCursor({
          createdAt: lastReply.createdAt.toISOString(),
          id: lastReply._id.toHexString(),
        });
      }

      return reply.code(200).send({
        data: {
          nextCursor,
          replies: serializeMongoTypes(repliesResponse),
        },
        message: "Tool comment replies retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    onRequest: [fastify.requireUser],
    schema: {
      params: getToolCommentRepliesParamsSchema,
      querystring: getToolCommentRepliesQueryStringSchema,
      response: getToolCommentRepliesResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Tools"],
    },
    url: "/replies",
  });
};

export default getToolCommentReplies;
