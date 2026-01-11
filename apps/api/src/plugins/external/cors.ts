import cors, { type FastifyCorsOptions } from "@fastify/cors";
import fp from "fastify-plugin";

/**
 * This plugin enables the use of CORS.
 *
 * @see {@link https://github.com/fastify/fastify-cors}
 */
export default fp<FastifyCorsOptions>(
  async (fastify) => {
    fastify.register(cors, {
      origin: [fastify.env.CLIENT_BASE_URL],
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      credentials: true,
      maxAge: 86400,
    });
  },
  { name: "cors", dependencies: ["env"] },
);
