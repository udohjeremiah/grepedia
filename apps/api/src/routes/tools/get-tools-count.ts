import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { getToolsCountResponseSchemas } from "@workspace/shared/schemas/tools/get-tools-count";

const getToolsCount: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (_request, reply) {
      const tools = fastify.getToolCollection();
      const count = await tools.estimatedDocumentCount();

      return reply.code(200).send({
        data: { count },
        message: "Tools count retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    schema: {
      response: getToolsCountResponseSchemas,
      tags: ["Tools"],
    },
    url: "/count",
  });
};

export default getToolsCount;
