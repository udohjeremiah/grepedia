import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { z } from "zod";

const health: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async (_request, reply) => {
      const isProduction = fastify.env.NODE_ENV === "production";

      let databaseStatus: "error" | "ok" = "ok";
      let embedderStatus: "error" | "ok" = "ok";

      try {
        await fastify.getDatabase().command({ ping: 1 });
      } catch {
        databaseStatus = "error";
      }

      if (!isProduction) {
        try {
          const response = await fetch(`${fastify.env.OLLAMA_URL}/api/tags`, {
            signal: AbortSignal.timeout(3000),
          });
          if (!response.ok) {
            throw new Error("Ollama is unreachable");
          }
        } catch {
          embedderStatus = "error";
        }
      }

      return reply.code(200).send({
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
    url: "/",
  });
};

export default health;
