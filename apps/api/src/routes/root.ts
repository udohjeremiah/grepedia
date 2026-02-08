import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { z } from "zod";

const root: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: function () {
      return { root: true };
    },
    method: "GET",
    schema: {
      response: {
        default: z.object({
          root: z.boolean(),
        }),
      },
    },
    url: "/",
  });
};

export default root;
