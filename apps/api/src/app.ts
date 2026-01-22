// See this example if you want to run the application as a standalone Fastify executable:
// https://github.com/fastify/demo/blob/main/src/server.ts

import * as path from "node:path";
import AutoLoad, { AutoloadPluginOptions } from "@fastify/autoload";
import { FastifyPluginAsync } from "fastify";
import { fileURLToPath } from "node:url";
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
} from "fastify-type-provider-zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type AppOptions = {
  // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;

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
        success: false,
        message: "Request doesn't match the schema",
      });
    }

    if (isResponseSerializationError(error)) {
      return reply.code(500).send({
        success: false,
        message: "Response doesn't match the schema",
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
    options: { ...options, prefix: "/api" },
    forceESM: true,
  });

  // This loads all plugins defined in plugins/app.
  // Those should be support plugins that are reused
  // throughout your application.
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins/app"),
    options: { ...options, prefix: "/api" },
    forceESM: true,
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
    options: { ...options, prefix: "/api" },
    forceESM: true,
  });
};

export default app;
export { app, options };
