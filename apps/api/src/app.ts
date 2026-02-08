// See this example if you want to run the application as a standalone Fastify executable:
// https://github.com/fastify/demo/blob/main/src/server.ts

import AutoLoad, { AutoloadPluginOptions } from "@fastify/autoload";
import { FastifyPluginAsync } from "fastify";
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
} from "fastify-type-provider-zod";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type AppOptions = Partial<AutoloadPluginOptions> & {
  // Place your custom options for app below here.
};

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  options,
): Promise<void> => {
  // Place here your custom code!

  // Set custom error handler
  fastify.setErrorHandler((error, request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.code(400).send({
        message: "Request doesn't match the schema",
        success: false,
      });
    }

    if (isResponseSerializationError(error)) {
      return reply.code(500).send({
        message: "Response doesn't match the schema",
        success: false,
      });
    }

    return reply.send(error);
  });

  // Do not touch the following lines

  // This loads all external plugins defined in plugins/external.
  // Those should be registered first as your application plugins
  // might depend on them.
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins/external"),
    forceESM: true,
    options: { ...options, prefix: "/api" },
  });

  // This loads all plugins defined in plugins/app.
  // Those should be support plugins that are reused
  // throughout your application.
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins/app"),
    forceESM: true,
    options: { ...options, prefix: "/api" },
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
    forceESM: true,
    options: { ...options, prefix: "/api" },
  });
};

export default app;
export { app, options };
