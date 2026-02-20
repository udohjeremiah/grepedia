import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  getUserParamsSchema,
  getUserResponseSchemas,
} from "@workspace/shared/schemas/users/get-user";
import { ObjectId } from "mongodb";

import { serializeMongoTypes } from "@/utils/serialize-mongo-types.js";

const getUser: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { userId } = request.params;

      const users = fastify.getUserCollection();

      const userObjectId = ObjectId.createFromHexString(userId);
      const user = await users.findOne({ _id: userObjectId });

      if (!user) {
        return reply.code(404).send({
          message: "User not found",
          success: false,
        });
      }

      const userWithStringIds = serializeMongoTypes(user);

      return reply.code(200).send({
        data: { user: userWithStringIds },
        message: "User retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    onRequest: [fastify.requireUserId()],
    schema: {
      params: getUserParamsSchema,
      response: getUserResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Users"],
    },
    url: "/",
  });
};

export default getUser;
