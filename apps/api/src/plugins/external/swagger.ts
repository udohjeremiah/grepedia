import swagger, { type FastifySwaggerOptions } from "@fastify/swagger";
import fp from "fastify-plugin";

import { jsonSchemaTransform } from "fastify-type-provider-zod";

/**
 * This plugin enables automatic generation of
 * OpenAPI specification from your route schemas
 *
 * @see {@link https://github.com/fastify/fastify-swagger}
 */
export default fp<FastifySwaggerOptions>(
  async (fastify) => {
    fastify.register(swagger, {
      openapi: {
        info: {
          title: "Grepedia API",
          description:
            "The encyclopedia of tools powered by collective wisdom.",
          version: "1.0.0",
        },
        servers: [],
      },
      transform: jsonSchemaTransform,
    });
  },
  { name: "swagger", dependencies: ["type-provider-zod"] },
);
