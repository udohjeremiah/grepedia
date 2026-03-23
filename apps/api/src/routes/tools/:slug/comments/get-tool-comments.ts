import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { objectIdSchema } from "@workspace/shared/schemas/object-id";
import {
  getToolCommentsParamsSchema,
  getToolCommentsQueryStringSchema,
  getToolCommentsResponseSchemas,
} from "@workspace/shared/schemas/tools/comments/get-tool-comments";
import { ObjectId } from "mongodb";
import { z } from "zod";

import type { ToolCommentWithObjectIds } from "@/schemas/tools/tool-comment.js";

import {
  decodeCursor,
  encodeCursor,
  InvalidCursorError,
} from "@/utils/cursor.js";
import { serializeMongoTypes } from "@/utils/serialize-mongo-types.js";

const commentsCursorSchema = z.object({
  createdAt: z.iso.datetime(),
  id: objectIdSchema,
  score: z.number().optional(),
});

type CommentsCursor = z.infer<typeof commentsCursorSchema>;

const getToolComments: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      if (!request.user) throw new Error("User not authenticated");

      const { slug } = request.params;
      const { cursor, limit = 20, sort = "top" } = request.query;

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

      if (
        decodedCursor &&
        sort !== "newest" &&
        typeof decodedCursor.score !== "number"
      ) {
        return reply.code(400).send({
          message: "Invalid cursor",
          success: false,
        });
      }

      const cursorFilter = (() => {
        if (!decodedCursor) return;

        const cursorDate = new Date(decodedCursor.createdAt);
        const cursorId = ObjectId.createFromHexString(decodedCursor.id);
        const cursorScore = decodedCursor.score ?? 0;

        if (sort === "newest") {
          return {
            $or: [
              { createdAt: { $lt: cursorDate } },
              { _id: { $lt: cursorId }, createdAt: cursorDate },
            ],
          };
        }

        if (sort === "bottom") {
          return {
            $or: [
              { score: { $gt: cursorScore } },
              { createdAt: { $gt: cursorDate }, score: cursorScore },
              {
                _id: { $gt: cursorId },
                createdAt: cursorDate,
                score: cursorScore,
              },
            ],
          };
        }

        return {
          $or: [
            { score: { $lt: cursorScore } },
            { createdAt: { $lt: cursorDate }, score: cursorScore },
            {
              _id: { $lt: cursorId },
              createdAt: cursorDate,
              score: cursorScore,
            },
          ],
        };
      })();

      const baseMatch = {
        parentCommentId: { $exists: false },
        toolId: tool._id,
      };

      const sortStage = (() => {
        if (sort === "newest") {
          // eslint-disable-next-line perfectionist/sort-objects
          return { createdAt: -1, _id: -1 };
        }

        if (sort === "bottom") {
          // eslint-disable-next-line perfectionist/sort-objects
          return { score: 1, createdAt: 1, _id: 1 };
        }

        // eslint-disable-next-line perfectionist/sort-objects
        return { score: -1, createdAt: -1, _id: -1 };
      })();

      const pipeline = [
        { $match: baseMatch },
        {
          $addFields: {
            score: {
              $subtract: ["$stats.upvotes", "$stats.downvotes"],
            },
          },
        },
        ...(cursorFilter ? [{ $match: cursorFilter }] : []),
        { $sort: sortStage },
        { $limit: limit },
      ];

      const toolComments = await comments
        .aggregate<ToolCommentWithObjectIds & { score: number }>(pipeline)
        .toArray();

      const commentList = toolComments.filter(
        (
          comment,
        ): comment is ToolCommentWithObjectIds & {
          _id: ObjectId;
          score: number;
        } => comment._id instanceof ObjectId,
      );

      const userIds = [
        ...new Set(
          commentList
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
      const commentIds = commentList.map((comment) => comment._id);
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

      const commentsResponse = commentList.map((comment) => {
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
      const lastComment = commentList.at(-1);

      if (lastComment && commentList.length === limit) {
        const lastScore =
          lastComment.stats.upvotes - lastComment.stats.downvotes;
        nextCursor = encodeCursor({
          createdAt: lastComment.createdAt.toISOString(),
          id: lastComment._id.toHexString(),
          score: sort === "newest" ? undefined : lastScore,
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
