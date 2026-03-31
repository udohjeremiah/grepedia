import mongodb, { type FastifyMongodbOptions } from "@fastify/mongodb";
import fp from "fastify-plugin";

/**
 * This plugin adds a mongodb connection pool
 * you can share in every part of your application.
 *
 * @see {@link https://github.com/fastify/fastify-mongodb}
 */
export default fp<FastifyMongodbOptions>(
  async (fastify) => {
    fastify.register(mongodb, {
      appName: fastify.env.APP_NAME,
      database: fastify.env.MONGODB_DATABASE,
      forceClose: true,
      ignoreUndefined: true,
      serverApi: {
        deprecationErrors: true,
        // Disabled because Atlas Vector Search ($vectorSearch) is rejected
        // under apiStrict=true in API Version 1.
        // strict: true,
        version: "1",
      },
      url: fastify.env.MONGODB_URL,
    });
  },
  { dependencies: ["env"], name: "mongodb" },
);
