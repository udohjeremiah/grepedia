import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

const health: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    method: "GET",
    url: "/health",
    schema: {
      response: {
        default: z.object({
          server: z.literal("ok"),
          database: z.enum(["ok", "error"]),
          embedder: z.enum(["ok", "error"]),
          timestamp: z.iso.datetime(),
        }),
      },
    },
    handler: async (_request, reply) => {
      let databaseStatus: "ok" | "error" = "ok";

      try {
        await fastify.getDatabase().command({ ping: 1 });
      } catch {
        databaseStatus = "error";
      }

      const embedderStatus = fastify.embedder ? "ok" : "error";

      const statusCode =
        databaseStatus === "ok" && embedderStatus === "ok" ? 200 : 503;

      return reply.code(statusCode).send({
        server: "ok",
        database: databaseStatus,
        embedder: embedderStatus,
        timestamp: new Date().toISOString(),
      });
    },
  });
};

export default health;
