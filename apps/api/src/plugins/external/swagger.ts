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
        components: {
          securitySchemes: {
            sessionCookie: {
              in: "cookie",
              name: "grepedia.session_token",
              type: "apiKey",
            },
          },
        },
        info: {
          description:
            "The encyclopedia of tools powered by collective wisdom.",
          title: "Grepedia API",
          version: "1.0.0",
        },
        servers: [],
      },
      transform: jsonSchemaTransform,
    });
  },
  { dependencies: ["type-provider-zod"], name: "swagger" },
);
