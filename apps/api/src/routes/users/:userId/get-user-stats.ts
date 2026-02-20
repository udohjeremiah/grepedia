import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  getUserStatsParamsSchema,
  getUserStatsResponseSchemas,
} from "@workspace/shared/schemas/users/get-user-stats";
import { ObjectId } from "mongodb";

const getUserStats: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { userId } = request.params;

      const users = fastify.getUserCollection();
      const userBookmarks = fastify.getUserBookmarkCollection();
      const tools = fastify.getToolCollection();
      const toolReactions = fastify.getToolReactionCollection();
      const toolComments = fastify.getToolCommentCollection();

      const userObjectId = ObjectId.createFromHexString(userId);
      const user = await users.findOne({ _id: userObjectId });

      if (!user) {
        return reply.code(404).send({
          message: "User not found",
          success: false,
        });
      }

      const [
        toolsOwned,
        toolsAdded,
        toolsUpdated,
        upvotes,
        downvotes,
        comments,
        sessions,
        bookmarks,
      ] = await Promise.all([
        tools.countDocuments({ owner: user._id }),
        tools.countDocuments({ addedBy: user._id }),
        tools.countDocuments({ updatedBy: user._id }),
        toolReactions.countDocuments({ userId: user._id, value: 1 }),
        toolReactions.countDocuments({ userId: user._id, value: -1 }),
        toolComments.countDocuments({ userId: user._id }),
        fastify.auth.api.listSessions({ headers: request.headers }),
        userBookmarks.countDocuments({ userId: user._id }),
      ]);

      const stats = {
        bookmarks,
        sessions: sessions.length,
        tools:
          toolsOwned +
          toolsAdded +
          toolsUpdated +
          upvotes +
          downvotes +
          comments,
      };

      return reply.code(200).send({
        data: { stats },
        message: "User stats retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    onRequest: [fastify.requireUserId()],
    schema: {
      params: getUserStatsParamsSchema,
      response: getUserStatsResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Users"],
    },
    url: "/stats",
  });
};

export default getUserStats;
