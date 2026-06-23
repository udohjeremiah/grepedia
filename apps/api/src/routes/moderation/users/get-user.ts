import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  moderatorGetUserQueryStringSchema,
  moderatorGetUserResponseSchemas,
} from "@workspace/shared/schemas/moderation/moderator-get-user";

const getUser: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { username } = request.query;

      const users = fastify.db.users;
      const tools = fastify.db.tools;
      const toolReactions = fastify.db.toolReactions;

      const user = await users.findOne(
        { username },
        { projection: { _id: 1, role: 1, status: 1, username: 1 } },
      );

      if (!user) {
        return reply.code(404).send({
          message: "User not found",
          success: false,
        });
      }

      const [toolsAdded, toolReactionsCount] = await Promise.all([
        tools.countDocuments({ addedBy: user._id }),
        toolReactions.countDocuments({ userId: user._id }),
      ]);

      const totalContributions = toolsAdded + toolReactionsCount;

      return reply.code(200).send({
        data: {
          user: {
            contributions: {
              toolReactions: toolReactionsCount,
              toolsAdded,
              total: totalContributions,
            },
            id: user._id.toHexString(),
            role: user.role,
            status: user.status,
            username: user.username,
          },
        },
        message: "User retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    onRequest: [fastify.requireModerator],
    schema: {
      querystring: moderatorGetUserQueryStringSchema,
      response: moderatorGetUserResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Moderation"],
    },
    url: "/lookup",
  });
};

export default getUser;
