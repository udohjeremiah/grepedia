import type { Collection, Db } from "mongodb";

import fp from "fastify-plugin";

import type { ToolCommentReactionWithObjectIds } from "@/schemas/tools/tool-comment-reaction.js";
import type { ToolCommentWithObjectIds } from "@/schemas/tools/tool-comment.js";
import type { ToolReactionWithObjectIds } from "@/schemas/tools/tool-reaction.js";
import type { ToolWithObjectIds } from "@/schemas/tools/tool.js";
import type { UserBookmarkWithObjectIds } from "@/schemas/users/user-bookmark.js";
import type { UserWithObjectIds } from "@/schemas/users/user.js";

declare module "fastify" {
  interface FastifyInstance {
    getDatabase: () => Db;
    getToolCollection: () => Collection<ToolWithObjectIds>;
    getToolCommentCollection: () => Collection<ToolCommentWithObjectIds>;
    getToolCommentReactionCollection: () => Collection<ToolCommentReactionWithObjectIds>;
    getToolReactionCollection: () => Collection<ToolReactionWithObjectIds>;
    getUserBookmarkCollection: () => Collection<UserBookmarkWithObjectIds>;
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

    const userBookmarkCollection =
      database.collection<UserBookmarkWithObjectIds>(
        fastify.env.MONGODB_COLL_USER_BOOKMARK,
      );

    const toolCollection = database.collection<ToolWithObjectIds>(
      fastify.env.MONGODB_COLL_TOOL,
    );

    const toolReactionCollection =
      database.collection<ToolReactionWithObjectIds>(
        fastify.env.MONGODB_COLL_TOOL_REACTION,
      );

    const toolCommentCollection = database.collection<ToolCommentWithObjectIds>(
      fastify.env.MONGODB_COLL_TOOL_COMMENT,
    );

    const toolCommentReactionCollection =
      database.collection<ToolCommentReactionWithObjectIds>(
        fastify.env.MONGODB_COLL_TOOL_COMMENT_REACTION,
      );

    await Promise.all([
      userCollection.createIndex({ username: 1 }, { unique: true }),

      userBookmarkCollection.createIndex(
        // eslint-disable-next-line perfectionist/sort-objects
        { userId: 1, toolId: 1 },
        { unique: true },
      ),
      // eslint-disable-next-line perfectionist/sort-objects
      userBookmarkCollection.createIndex({ userId: 1, createdAt: -1 }),

      // eslint-disable-next-line perfectionist/sort-objects
      toolCollection.createIndex({ status: 1, _id: -1 }),
      // eslint-disable-next-line perfectionist/sort-objects
      toolCollection.createIndex({ status: 1, released_at: -1, _id: -1 }),
      // eslint-disable-next-line perfectionist/sort-objects
      toolCollection.createIndex({ status: 1, "stats.comments": -1, _id: -1 }),
      toolCollection.createIndex({
        status: 1,
        // eslint-disable-next-line perfectionist/sort-objects
        "stats.upvotes": -1,
        // eslint-disable-next-line perfectionist/sort-objects
        "stats.downvotes": -1,
        // eslint-disable-next-line perfectionist/sort-objects
        _id: -1,
      }),
      toolCollection.createIndex({ _id: -1, "stats.comments": -1, status: 1 }),
      // eslint-disable-next-line perfectionist/sort-objects
      toolCollection.createIndex({ status: 1, _id: -1, owner: 1 }),

      toolReactionCollection.createIndex(
        { toolId: 1, userId: 1 },
        { unique: true },
      ),
      toolReactionCollection.createIndex({ toolId: 1, value: 1 }),

      // eslint-disable-next-line perfectionist/sort-objects
      toolCommentCollection.createIndex({ toolId: 1, createdAt: -1 }),
      // eslint-disable-next-line perfectionist/sort-objects
      toolCommentCollection.createIndex({ userId: 1, createdAt: -1 }),

      toolCommentReactionCollection.createIndex(
        { commentId: 1, userId: 1 },
        { unique: true },
      ),
      toolCommentReactionCollection.createIndex({ commentId: 1, value: 1 }),
    ]);

    fastify.decorate("getDatabase", () => database);
    fastify.decorate("getUserCollection", () => userCollection);
    fastify.decorate("getUserBookmarkCollection", () => userBookmarkCollection);
    fastify.decorate("getToolCollection", () => toolCollection);
    fastify.decorate("getToolReactionCollection", () => toolReactionCollection);
    fastify.decorate("getToolCommentCollection", () => toolCommentCollection);
    fastify.decorate(
      "getToolCommentReactionCollection",
      () => toolCommentReactionCollection,
    );
  },
  { dependencies: ["mongodb"], name: "database" },
);
