import { getToolsCount200ResponseSchema } from "@workspace/shared/schemas/get-tools-count";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

const getToolsCount: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    method: "GET",
    url: "/count",
    schema: {
      response: {
        default: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.unknown().optional(),
        }),
        200: getToolsCount200ResponseSchema,
      },
    },
    handler: async function (_request, reply) {
      const tools = fastify.getToolCollection();
      const count = await tools.estimatedDocumentCount();

      return reply.code(200).send({
        success: true,
        message: "Tools count retrieved successfully",
        data: count,
      });
    },
  });
};

export default getToolsCount;
