import env, { type FastifyEnvOptions } from "@fastify/env";
import fp from "fastify-plugin";

declare module "fastify" {
  export interface FastifyInstance {
    env: {
      APP_NAME: string;
      CLIENT_BASE_URL: string;
      EMAIL_AUTH: string;
      MONGODB_COLL_TOOL: string;
      MONGODB_COLL_USER: string;
      MONGODB_DATABASE: string;
      MONGODB_URL: string;
      NODE_ENV: "development" | "production";
      PORT: number;
      RESEND_API_KEY: string;
    };
  }
}

const options: FastifyEnvOptions = {
  confKey: "env",
  data: process.env,
  dotenv: true,
  schema: {
    properties: {
      APP_NAME: {
        default: "api",
        type: "string",
      },
      CLIENT_BASE_URL: {
        default: "*",
        type: "string",
      },
      EMAIL_AUTH: {
        default: "Grepedia <auth@resend.dev>",
        type: "string",
      },
      MONGODB_COLL_TOOL: {
        default: "my-tool",
        type: "string",
      },
      MONGODB_COLL_USER: {
        default: "my-user",
        type: "string",
      },
      MONGODB_DATABASE: {
        default: "my-db",
        type: "string",
      },
      MONGODB_URL: {
        default: "mongodb://localhost:27017",
        type: "string",
      },
      NODE_ENV: {
        default: "development",
        type: "string",
      },
      PORT: {
        default: 4000,
        type: "number",
      },
      RESEND_API_KEY: {
        default: "re_xxxxxxxxx",
        type: "string",
      },
    },
    required: [
      "NODE_ENV",
      "PORT",
      "APP_NAME",
      "MONGODB_URL",
      "MONGODB_DATABASE",
      "MONGODB_COLL_USER",
      "MONGODB_COLL_TOOL",
      "RESEND_API_KEY",
      "EMAIL_AUTH",
      "CLIENT_BASE_URL",
    ],
    type: "object",
  },
};

/**
 * This plugin helps to check environment variables.
 *
 * @see {@link https://github.com/fastify/fastify-env}
 */
export default fp<FastifyEnvOptions>(
  async (fastify) => {
    fastify.register(env, options);
  },
  { name: "env" },
);
