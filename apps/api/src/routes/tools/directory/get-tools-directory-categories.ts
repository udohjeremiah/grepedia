import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { getToolsDirectoryCategoriesResponseSchemas } from "@workspace/shared/schemas/tools/directory/get-tools-directory-categories";

const getToolsDirectoryCategories: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (_request, reply) {
      const tools = fastify.db.tools;

      const categories = await tools
        .aggregate<{
          count: number;
          name: string;
        }>([
          { $match: { status: "published" } },
          { $unwind: "$categories" },
          {
            $group: {
              _id: "$categories",
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              count: 1,
              name: "$_id",
            },
          },
          {
            $sort: {
              name: 1,
            },
          },
        ])
        .toArray();

      return reply.code(200).send({
        data: { categories },
        message: "Tools directory categories retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    schema: {
      response: getToolsDirectoryCategoriesResponseSchemas,
      tags: ["Tools"],
    },
    url: "/categories",
  });
};

export default getToolsDirectoryCategories;
