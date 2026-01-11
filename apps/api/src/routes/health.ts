import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

const health: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    method: "GET",
    url: "/health",
    schema: {
      response: {
        default: z.object({
          server: z.enum(["ok", "error"]),
          database: z.enum(["ok", "error"]),
          timestamp: z.date(),
        }),
      },
    },
    handler: async function (_request, reply) {
      try {
        await fastify.getDatabase().command({ ping: 1 });
      } catch {
        return reply
          .code(503)
          .send({ server: "ok", database: "error", timestamp: new Date() });
      }

      return reply.send({
        server: "ok",
        database: "ok",
        timestamp: new Date(),
      });
    },
  });
};

export default health;
