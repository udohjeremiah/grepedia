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
      url: fastify.env.MONGODB_URL,
      database: fastify.env.MONGODB_DATABASE,
      serverApi: {
        version: "1",
        strict: true,
        deprecationErrors: true,
      },
      forceClose: true,
    });
  },
  { name: "mongodb", dependencies: ["env"] },
);
