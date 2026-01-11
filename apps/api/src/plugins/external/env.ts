import env, { type FastifyEnvOptions } from "@fastify/env";
import fp from "fastify-plugin";

declare module "fastify" {
  export interface FastifyInstance {
    env: {
      NODE_ENV: "development" | "production";
      PORT: number;
      APP_NAME: string;
      MONGODB_URL: string;
      MONGODB_DATABASE: string;
      MONGODB_COLL_USER: string;
      RESEND_API_KEY: string;
      AUTH_EMAIL: string;
      CLIENT_BASE_URL: string;
    };
  }
}

const options: FastifyEnvOptions = {
  confKey: "env",
  schema: {
    type: "object",
    required: [
      "NODE_ENV",
      "PORT",
      "APP_NAME",
      "MONGODB_URL",
      "MONGODB_DATABASE",
      "MONGODB_COLL_USER",
      "RESEND_API_KEY",
      "AUTH_EMAIL",
      "CLIENT_BASE_URL",
    ],
    properties: {
      NODE_ENV: {
        type: "string",
        default: "development",
      },
      PORT: {
        type: "number",
        default: 4000,
      },
      APP_NAME: {
        type: "string",
        default: "api",
      },
      MONGODB_URL: {
        type: "string",
        default: "mongodb://localhost:27017",
      },
      MONGODB_DATABASE: {
        type: "string",
        default: "my-db",
      },
      MONGODB_COLL_USER: {
        type: "string",
        default: "my-users",
      },
      RESEND_API_KEY: {
        type: "string",
        default: "re_xxxxxxxxx",
      },
      AUTH_EMAIL: {
        type: "string",
        default: "Grepedia <auth@resend.dev>",
      },
      CLIENT_BASE_URL: {
        type: "string",
        default: "*",
      },
    },
  },
  dotenv: true,
  data: process.env,
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
