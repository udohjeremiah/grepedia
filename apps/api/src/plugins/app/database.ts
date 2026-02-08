import type { Collection, Db } from "mongodb";

import fp from "fastify-plugin";

import type { ToolWithObjectIds } from "@/schemas/tool.js";
import type { UserWithObjectIds } from "@/schemas/user.js";

declare module "fastify" {
  interface FastifyInstance {
    getDatabase: () => Db;
    getToolCollection: () => Collection<ToolWithObjectIds>;
    getUserCollection: () => Collection<UserWithObjectIds>;
  }
}

/**
 * This plugin initializes MongoDB collections,
 * and exposes typed collection accessors.
 *
 * @see {@link https://zod.dev}
 */
export default fp(
  async (fastify) => {
    const database = fastify.mongo?.db;
    if (!database) {
      throw new Error("MongoDB database is not initialized");
    }

    const userCollection = database.collection<UserWithObjectIds>(
      fastify.env.MONGODB_COLL_USER,
    );

    const toolCollection = database.collection<ToolWithObjectIds>(
      fastify.env.MONGODB_COLL_TOOL,
    );
    // eslint-disable-next-line perfectionist/sort-objects
    toolCollection.createIndex({ status: 1, _id: -1 });
    // eslint-disable-next-line perfectionist/sort-objects
    toolCollection.createIndex({ status: 1, released_at: -1, _id: -1 });
    // eslint-disable-next-line perfectionist/sort-objects
    toolCollection.createIndex({ status: 1, "stats.comments": -1, _id: -1 });
    toolCollection.createIndex({
      status: 1,
      // eslint-disable-next-line perfectionist/sort-objects
      "stats.upvotes": -1,
      // eslint-disable-next-line perfectionist/sort-objects
      "stats.downvotes": -1,
      // eslint-disable-next-line perfectionist/sort-objects
      _id: -1,
    });
    toolCollection.createIndex({ _id: -1, "stats.comments": -1, status: 1 });
    // eslint-disable-next-line perfectionist/sort-objects
    toolCollection.createIndex({ status: 1, _id: -1, owner: 1 });

    fastify.decorate("getDatabase", () => database);
    fastify.decorate("getUserCollection", () => userCollection);
    fastify.decorate("getToolCollection", () => toolCollection);
  },
  { dependencies: ["mongodb"], name: "database" },
);
