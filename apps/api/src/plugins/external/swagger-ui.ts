import swaggerUi, { type FastifySwaggerUiOptions } from "@fastify/swagger-ui";
import fp from "fastify-plugin";

/**
 * This plugin enables serving Swagger UI
 * directly from your OpenAPI specification
 *
 * @see {@link https://github.com/fastify/fastify-swagger}
 */
export default fp<FastifySwaggerUiOptions>(
  async (fastify) => {
    fastify.register(swaggerUi);
  },
  { dependencies: ["swagger"], name: "swagger-ui" },
);
