import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { getToolsStatsResponseSchemas } from "@workspace/shared/schemas/tools/get-tools-stats";

const getToolsStats: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (_request, reply) {
      const tools = fastify.db.tools;
      const comments = fastify.db.toolComments;

      const [toolsCount, reviewsCount, addedByIds, updatedByIds] =
        await Promise.all([
          tools.estimatedDocumentCount(),
          comments.estimatedDocumentCount(),
          tools.distinct("addedBy"),
          tools.distinct("updatedBy"),
        ]);

      const contributorIds = new Set<string>();
      for (const contributorId of [...addedByIds, ...updatedByIds]) {
        if (contributorId) {
          contributorIds.add(contributorId.toString());
        }
      }

      const stats = {
        contributors: contributorIds.size,
        reviews: reviewsCount,
        tools: toolsCount,
      };

      return reply.code(200).send({
        data: { stats },
        message: "Tools stats retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    schema: {
      response: getToolsStatsResponseSchemas,
      tags: ["Tools"],
    },
    url: "/stats",
  });
};

export default getToolsStats;
