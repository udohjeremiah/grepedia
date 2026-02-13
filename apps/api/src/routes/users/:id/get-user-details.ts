import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  getUserDetailsParamsSchema,
  getUserDetailsResponseSchemas,
} from "@workspace/shared/schemas/users/get-user-details";
import { ObjectId } from "mongodb";

import { serializeMongoTypes } from "@/utils/serialize-mongo-types.js";

const getUserDetails: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { id } = request.params;

      const users = fastify.getUserCollection();

      const userId = ObjectId.createFromHexString(id);
      const user = await users.findOne({ _id: userId });
      if (!user) {
        return reply.code(404).send({
          message: "User not found",
          success: false,
        });
      }

      const userWithStringIds = serializeMongoTypes(user);

      return reply.code(200).send({
        data: userWithStringIds,
        message: "User details retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    onRequest: fastify.requireUser,
    schema: {
      params: getUserDetailsParamsSchema,
      response: getUserDetailsResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Users"],
    },
    url: "/details",
  });
};

export default getUserDetails;
