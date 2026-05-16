import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  generateToolBodySchema,
  generateToolResponseSchemas,
} from "@workspace/shared/schemas/tools/generate-tool";

const generateTool: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { url } = request.body;

      let crawledText: string;
      try {
        crawledText = await fastify.crawlUrl(url);
      } catch (error) {
        fastify.log.error(error, "Crawl error");
        return reply.code(422).send({
          message: "Failed to crawl the provided URL",
          success: false,
        });
      }

      let data;
      try {
        data = await fastify.generateTool(crawledText);
      } catch (error) {
        fastify.log.error(error, "Tool generation error");
        return reply.code(500).send({
          message: "Failed to generate tool entry from crawled content",
          success: false,
        });
      }

      return reply.code(200).send({
        data,
        message: "Tool entry generated successfully",
        success: true,
      });
    },
    method: "POST",
    onRequest: [fastify.requireStatus("active")],
    schema: {
      body: generateToolBodySchema,
      response: generateToolResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Tools"],
    },
    url: "/generate",
  });
};

export default generateTool;
