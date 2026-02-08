import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { getToolsCount200ResponseSchema } from "@workspace/shared/schemas/get-tools-count";
import { z } from "zod";

const getToolsCount: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (_request, reply) {
      const tools = fastify.getToolCollection();
      const count = await tools.estimatedDocumentCount();

      return reply.code(200).send({
        data: count,
        message: "Tools count retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    schema: {
      response: {
        200: getToolsCount200ResponseSchema,
        default: z.object({
          data: z.unknown().optional(),
          message: z.string(),
          success: z.boolean(),
        }),
      },
    },
    url: "/count",
  });
};

export default getToolsCount;
