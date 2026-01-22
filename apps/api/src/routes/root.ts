import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

const root: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    method: "GET",
    url: "/",
    schema: {
      response: {
        default: z.object({
          root: z.boolean(),
        }),
      },
    },
    handler: function () {
      return { root: true };
    },
  });
};

export default root;
