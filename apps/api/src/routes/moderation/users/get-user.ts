import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  moderatorGetUserQuerySchema,
  moderatorGetUserResponseSchemas,
} from "@workspace/shared/schemas/moderation/moderator-get-user";

import { serializeMongoTypes } from "@/utils/serialize-mongo-types.js";

const getUser: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { username } = request.query;

      const users = fastify.db.users;
      const tools = fastify.db.tools;
      const toolReactions = fastify.db.toolReactions;
      const toolComments = fastify.db.toolComments;

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

      const [toolsAdded, toolsUpdated, toolCommentsCount, toolReactionsCount] =
        await Promise.all([
          tools.countDocuments({ addedBy: user._id }),
          tools.countDocuments({ updatedBy: user._id }),
          toolComments.countDocuments({ userId: user._id }),
          toolReactions.countDocuments({ userId: user._id }),
        ]);

      const totalContributions =
        toolsAdded + toolsUpdated + toolCommentsCount + toolReactionsCount;

      const trustProfile = await fastify.evaluateUserTrust(user._id);

      return reply.code(200).send({
        data: {
          user: {
            contributions: {
              toolComments: toolCommentsCount,
              toolReactions: toolReactionsCount,
              toolsAdded,
              toolsUpdated,
              total: totalContributions,
            },
            id: user._id.toHexString(),
            role: user.role,
            status: user.status,
            trustProfile: trustProfile
              ? serializeMongoTypes(trustProfile)
              : undefined,
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
      querystring: moderatorGetUserQuerySchema,
      response: moderatorGetUserResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Moderation"],
    },
    url: "/lookup",
  });
};

export default getUser;
