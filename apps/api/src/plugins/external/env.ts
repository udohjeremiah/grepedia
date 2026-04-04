import env, { type FastifyEnvOptions } from "@fastify/env";
import fp from "fastify-plugin";

declare module "fastify" {
  export interface FastifyInstance {
    env: {
      ADMIN_USER_IDS: string;
      APP_NAME: string;
      BASE_URL: string;
      CLIENT_BASE_URL: string;
      COOKIE_DOMAIN: string;
      EMAIL_AUTH: string;
      GEMINI_API_KEY: string;
      MIN_VECTOR_SCORE: number;
      MONGODB_COLL_MODERATION_CASE: string;
      MONGODB_COLL_TOOL: string;
      MONGODB_COLL_TOOL_COMMENT: string;
      MONGODB_COLL_TOOL_COMMENT_REACTION: string;
      MONGODB_COLL_TOOL_REACTION: string;
      MONGODB_COLL_TOOL_REVISION: string;
      MONGODB_COLL_USER: string;
      MONGODB_COLL_USER_BOOKMARK: string;
      MONGODB_DATABASE: string;
      MONGODB_URL: string;
      NODE_ENV: "development" | "production" | "testing";
      PORT: number;
      RESEND_API_KEY: string;
      USER_DATA_EXPORT_SIGNING_SECRET: string;
    };
  }
}

const options: FastifyEnvOptions = {
  confKey: "env",
  data: process.env,
  dotenv: true,
  schema: {
    properties: {
      ADMIN_USER_IDS: {
        default: "",
        type: "string",
      },
      APP_NAME: {
        default: "api",
        type: "string",
      },
      BASE_URL: {
        default: "http://localhost:4000",
        type: "string",
      },
      CLIENT_BASE_URL: {
        default: "*",
        type: "string",
      },
      COOKIE_DOMAIN: {
        default: "localhost",
        type: "string",
      },
      EMAIL_AUTH: {
        default: "Grepedia <auth@resend.dev>",
        type: "string",
      },
      GEMINI_API_KEY: {
        default: "********",
        type: "string",
      },
      MIN_VECTOR_SCORE: {
        default: 0.5,
        type: "number",
      },
      MONGODB_COLL_MODERATION_CASE: {
        default: "moderation-case",
        type: "string",
      },
      MONGODB_COLL_TOOL: {
        default: "tool",
        type: "string",
      },
      MONGODB_COLL_TOOL_COMMENT: {
        default: "tool-comment",
        type: "string",
      },
      MONGODB_COLL_TOOL_COMMENT_REACTION: {
        default: "tool-comment-reaction",
        type: "string",
      },
      MONGODB_COLL_TOOL_REACTION: {
        default: "tool-reaction",
        type: "string",
      },
      MONGODB_COLL_TOOL_REVISION: {
        default: "tool-revision",
        type: "string",
      },
      MONGODB_COLL_USER: {
        default: "user",
        type: "string",
      },
      MONGODB_COLL_USER_BOOKMARK: {
        default: "user-bookmark",
        type: "string",
      },
      MONGODB_DATABASE: {
        default: "grepedia",
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
      USER_DATA_EXPORT_SIGNING_SECRET: {
        default: "dev-user-data-export-signing-secret-change-me",
        type: "string",
      },
    },
    required: [
      "NODE_ENV",
      "PORT",
      "APP_NAME",
      "BASE_URL",
      "MONGODB_URL",
      "MONGODB_DATABASE",
      "ADMIN_USER_IDS",
      "MONGODB_COLL_USER",
      "MONGODB_COLL_USER_BOOKMARK",
      "MONGODB_COLL_TOOL",
      "MONGODB_COLL_TOOL_REACTION",
      "MONGODB_COLL_TOOL_COMMENT",
      "MONGODB_COLL_TOOL_COMMENT_REACTION",
      "MONGODB_COLL_TOOL_REVISION",
      "MONGODB_COLL_MODERATION_CASE",
      "USER_DATA_EXPORT_SIGNING_SECRET",
      "GEMINI_API_KEY",
      "MIN_VECTOR_SCORE",
      "RESEND_API_KEY",
      "EMAIL_AUTH",
      "CLIENT_BASE_URL",
      "COOKIE_DOMAIN",
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
