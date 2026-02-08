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
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      credentials: true,
      maxAge: 86_400,
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      origin: [fastify.env.CLIENT_BASE_URL],
    });
  },
  { dependencies: ["env"], name: "cors" },
);
