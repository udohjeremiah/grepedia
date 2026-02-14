import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  getUserSummaryParamsSchema,
  getUserSummaryResponseSchemas,
} from "@workspace/shared/schemas/users/get-user-summary";
import { ObjectId } from "mongodb";

const getUserSummary: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { id } = request.params;

      const users = fastify.getUserCollection();
      const usersBookmarks = fastify.getUserBookmarkCollection();
      const tools = fastify.getToolCollection();
      const toolsReactions = fastify.getToolReactionCollection();
      const toolsComments = fastify.getToolCommentCollection();

      const userId = ObjectId.createFromHexString(id);
      const user = await users.findOne({ _id: userId });
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
        tools.countDocuments({ added_by: user._id }),
        tools.countDocuments({ updated_by: user._id }),
        toolsReactions.countDocuments({ userId: user._id, value: 1 }),
        toolsReactions.countDocuments({ userId: user._id, value: -1 }),
        toolsComments.countDocuments({ userId: user._id }),
        fastify.auth.api.listSessions({ headers: request.headers }),
        usersBookmarks.countDocuments({ userId: user._id }),
      ]);

      const activities =
        toolsOwned + toolsAdded + toolsUpdated + upvotes + downvotes + comments;

      return reply.code(200).send({
        data: {
          activities,
          bookmarks,
          sessions: sessions.length,
        },
        message: "User summary retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    onRequest: fastify.requireUser,
    schema: {
      params: getUserSummaryParamsSchema,
      response: getUserSummaryResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Users"],
    },
    url: "/summary",
  });
};

export default getUserSummary;
