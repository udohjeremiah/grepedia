import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { z } from "zod";

const health: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async (_request, reply) => {
      let databaseStatus: "error" | "ok" = "ok";

      try {
        await fastify.getDatabase().command({ ping: 1 });
      } catch {
        databaseStatus = "error";
      }

      const embedderStatus = fastify.embedder ? "ok" : "error";

      const statusCode =
        databaseStatus === "ok" && embedderStatus === "ok" ? 200 : 503;

      return reply.code(statusCode).send({
        database: databaseStatus,
        embedder: embedderStatus,
        server: "ok",
        timestamp: new Date().toISOString(),
      });
    },
    method: "GET",
    schema: {
      response: {
        default: z.object({
          database: z.enum(["ok", "error"]),
          embedder: z.enum(["ok", "error"]),
          server: z.literal("ok"),
          timestamp: z.iso.datetime(),
        }),
      },
    },
    url: "/health",
  });
};

export default health;
