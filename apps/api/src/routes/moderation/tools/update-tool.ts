import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  moderatorUpdateToolBodySchema,
  moderatorUpdateToolResponseSchemas,
} from "@workspace/shared/schemas/moderation/moderator-update-tool";

const updateTool: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { slug, status } = request.body;

      const tools = fastify.getToolCollection();
      const updateResult = await tools.findOneAndUpdate(
        { slug },
        { $set: { status, updatedAt: new Date() } },
        { projection: { slug: 1, status: 1 }, returnDocument: "after" },
      );

      if (!updateResult) {
        return reply.code(404).send({
          message: "Tool not found",
          success: false,
        });
      }

      return reply.code(200).send({
        data: {
          tool: { slug: updateResult.slug, status: updateResult.status },
        },
        message: "Tool updated successfully",
        success: true,
      });
    },
    method: "PATCH",
    onRequest: [fastify.requireModerator],
    schema: {
      body: moderatorUpdateToolBodySchema,
      response: moderatorUpdateToolResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Moderation"],
    },
    url: "/update",
  });
};

export default updateTool;
