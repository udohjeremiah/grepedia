import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  moderatorUpdateUserBodySchema,
  moderatorUpdateUserResponseSchemas,
} from "@workspace/shared/schemas/moderation/moderator-update-user";

const updateUser: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { role, status, username } = request.body;

      if (!role && !status) {
        return reply.code(400).send({
          message: "Provide a role or status update",
          success: false,
        });
      }

      const users = fastify.db.users;
      const updateResult = await users.findOneAndUpdate(
        { username },
        {
          $set: {
            role,
            status,
            updatedAt: new Date(),
          },
        },
        {
          projection: { _id: 1, role: 1, status: 1, username: 1 },
          returnDocument: "after",
        },
      );

      if (!updateResult) {
        return reply.code(404).send({
          message: "User not found",
          success: false,
        });
      }

      return reply.code(200).send({
        data: {
          user: {
            id: updateResult._id.toHexString(),
            role: updateResult.role,
            status: updateResult.status,
            username: updateResult.username,
          },
        },
        message: "User updated successfully",
        success: true,
      });
    },
    method: "PATCH",
    onRequest: [fastify.requireModerator],
    schema: {
      body: moderatorUpdateUserBodySchema,
      response: moderatorUpdateUserResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Moderation"],
    },
    url: "/update",
  });
};

export default updateUser;
