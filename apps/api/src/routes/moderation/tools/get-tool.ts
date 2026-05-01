import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  moderatorGetToolQuerySchema,
  moderatorGetToolResponseSchemas,
} from "@workspace/shared/schemas/moderation/moderator-get-tool";

const getTool: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { slug } = request.query;

      const tools = fastify.getToolCollection();

      const tool = await tools.findOne(
        { slug },
        { projection: { name: 1, shortDescription: 1, slug: 1, status: 1 } },
      );

      if (!tool) {
        return reply.code(404).send({
          message: "Tool not found",
          success: false,
        });
      }

      return reply.code(200).send({
        data: {
          tool: {
            name: tool.name,
            shortDescription: tool.shortDescription,
            slug: tool.slug,
            status: tool.status,
          },
        },
        message: "Tool retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    onRequest: [fastify.requireModerator],
    schema: {
      querystring: moderatorGetToolQuerySchema,
      response: moderatorGetToolResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Moderation"],
    },
    url: "/lookup",
  });
};

export default getTool;
