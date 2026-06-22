import env, { type FastifyEnvOptions } from "@fastify/env";
import fp from "fastify-plugin";

declare module "fastify" {
  export interface FastifyInstance {
    env: {
      ADMIN_USER_IDS: string;
      AI_EMBEDDING_MODEL: string;
      AI_GENERATION_MODEL: string;
      AI_PROMPT_TOOL_GENERATION: string;
      AI_PROVIDER: string;
      APP_NAME: string;
      BASE_URL: string;
      CLIENT_BASE_URL: string;
      COOKIE_DOMAIN: string;
      CRAWLEE_MAX_PAGES: number;
      EMAIL_AUTH: string;
      GEMINI_API_KEY: string;
      MONGODB_COLL_LIST: string;
      MONGODB_COLL_LIST_REACTION: string;
      MONGODB_COLL_LIST_VIEW: string;
      MONGODB_COLL_TOOL: string;
      MONGODB_COLL_TOOL_REACTION: string;
      MONGODB_COLL_USER: string;
      MONGODB_COLL_USER_BOOKMARK: string;
      MONGODB_DATABASE: string;
      MONGODB_URL: string;
      NODE_ENV: "development" | "production";
      OLLAMA_URL: string;
      PORT: number;
      RESEND_API_KEY: string;
      SEARCH_VECTOR_SCORE: number;
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
      AI_EMBEDDING_MODEL: {
        default: "gemini-embedding-001",
        type: "string",
      },
      AI_GENERATION_MODEL: {
        default: "gemini-2.0-flash",
        type: "string",
      },
      AI_PROMPT_TOOL_GENERATION: {
        type: "string",
      },
      AI_PROVIDER: {
        default: "gemini",
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
      CRAWLEE_MAX_PAGES: {
        default: 10,
        type: "number",
      },
      EMAIL_AUTH: {
        default: "Grepedia <auth@resend.dev>",
        type: "string",
      },
      GEMINI_API_KEY: {
        type: "string",
      },
      MONGODB_COLL_LIST: {
        default: "list",
        type: "string",
      },
      MONGODB_COLL_LIST_REACTION: {
        default: "list-reaction",
        type: "string",
      },
      MONGODB_COLL_LIST_VIEW: {
        default: "list-view",
        type: "string",
      },
      MONGODB_COLL_TOOL: {
        default: "tool",
        type: "string",
      },
      MONGODB_COLL_TOOL_REACTION: {
        default: "tool-reaction",
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
      OLLAMA_URL: {
        default: "http://localhost:11434",
        type: "string",
      },
      PORT: {
        default: 4000,
        type: "number",
      },
      RESEND_API_KEY: {
        type: "string",
      },
      SEARCH_VECTOR_SCORE: {
        default: 0.5,
        type: "number",
      },
    },
    required: [
      "NODE_ENV",
      "PORT",
      "APP_NAME",
      "BASE_URL",
      "CLIENT_BASE_URL",
      "COOKIE_DOMAIN",
      "MONGODB_URL",
      "MONGODB_DATABASE",
      "ADMIN_USER_IDS",
      "MONGODB_COLL_USER",
      "MONGODB_COLL_TOOL",
      "MONGODB_COLL_TOOL_REACTION",
      "MONGODB_COLL_USER_BOOKMARK",
      "MONGODB_COLL_LIST",
      "MONGODB_COLL_LIST_VIEW",
      "MONGODB_COLL_LIST_REACTION",
      "RESEND_API_KEY",
      "EMAIL_AUTH",
      "CRAWLEE_MAX_PAGES",
      "AI_PROVIDER",
      "AI_EMBEDDING_MODEL",
      "AI_GENERATION_MODEL",
      "AI_PROMPT_TOOL_GENERATION",
      "GEMINI_API_KEY",
      "OLLAMA_URL",
      "SEARCH_VECTOR_SCORE",
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
