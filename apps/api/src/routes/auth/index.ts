import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { fromNodeHeaders } from "better-auth/node";

const auth: FastifyPluginAsyncZod = async (fastify): Promise<void> => {
  fastify.route({
    handler: async function (request, reply) {
      try {
        // Construct request URL
        const url = new URL(request.url, `http://${request.headers.host}`);

        // Convert Fastify headers to standard Headers object
        const headers = fromNodeHeaders(request.headers);

        // Create Fetch API-compatible request
        const compatibleRequest = new Request(url.toString(), {
          headers,
          method: request.method,
          ...(request.body ? { body: JSON.stringify(request.body) } : {}),
        });

        // Process authentication request
        const response = await fastify.auth.handler(compatibleRequest);

        // Forward response to client
        reply.status(response.status);
        for (const [key, value] of response.headers.entries()) {
          reply.header(key, value);
        }
        // eslint-disable-next-line unicorn/no-null
        reply.send(response.body ? await response.text() : null);
      } catch (error) {
        fastify.log.error(error, "Authentication error");
        reply.status(500).send({
          code: "AUTH_FAILURE",
          error: "Internal authentication error",
        });
      }
    },
    method: ["GET", "POST"],
    schema: {
      tags: ["Authentication"],
    },
    url: "/*",
  });
};

export default auth;
