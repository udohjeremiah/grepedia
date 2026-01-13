import { User } from "@/schemas/user.js";
import fp from "fastify-plugin";
import type { Collection, Db } from "mongodb";
// import zodToMongoSchema from "zod-to-mongo-schema";

declare module "fastify" {
  interface FastifyInstance {
    getDatabase: () => Db;
    getUserCollection: () => Collection<User>;
  }
}

/**
 * This plugin initializes MongoDB collections,
 * applies JSON Schema validators generated from
 * Zod, and exposes typed collection accessors.
 *
 * @see {@link https://zod.dev}
 * @see {@link https://github.com/udohjeremiah/zod-to-mongo-schema}
 */
export default fp(
  async (fastify) => {
    const database = fastify.mongo?.db;
    if (!database) {
      throw new Error("MongoDB database is not initialized");
    }

    // const collections: Record<string, { validator: object }> = {
    //   [fastify.env.MONGODB_COLL_USER]: {
    //     validator: { $jsonSchema: zodToMongoSchema(userSchema) },
    //   },
    // };

    // for (const [name, { validator }] of Object.entries(collections)) {
    //   const collection = await database.listCollections({ name }).toArray();
    //   const exists = collection.length > 0;

    //   if (exists) {
    //     fastify.log.info(`'${name}' collection exists — updating validator...`);
    //     await database.command({ collMod: name, validator });
    //   } else {
    //     fastify.log.info(`Creating '${name}' collection...`);
    //     await database.createCollection(name, { validator });
    //   }
    // }

    const userCollection = database.collection<User>(
      fastify.env.MONGODB_COLL_USER,
    );

    fastify.decorate("getDatabase", () => database);
    fastify.decorate("getUserCollection", () => userCollection);
  },
  { name: "database", dependencies: ["mongodb"] },
);
