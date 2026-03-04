/* eslint-disable perfectionist/sort-objects */

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
      fastify.syncIndexes({
        collection: userBookmarkCollection,
        mode: "reconcile",
        specs: [
          {
            key: { userId: 1, toolId: 1 },
            options: {
              name: "grepedia__user_bookmark__userId_toolId",
              unique: true,
            },
          },
          {
            key: { userId: 1, createdAt: -1 },
            options: { name: "grepedia__user_bookmark__userId_createdAt_desc" },
          },
        ],
      }),
      fastify.syncIndexes({
        collection: toolCollection,
        mode: "reconcile",
        specs: [
          {
            key: { status: 1, _id: -1 },
            options: { name: "grepedia__tool__status_id_desc" },
          },
          {
            key: { status: 1, releasedAt: -1, _id: -1 },
            options: { name: "grepedia__tool__status_releasedAt_desc_id_desc" },
          },
          {
            key: { status: 1, "stats.comments": -1, _id: -1 },
            options: { name: "grepedia__tool__status_comments_desc_id_desc" },
          },
          {
            key: {
              status: 1,
              "stats.upvotes": -1,
              "stats.downvotes": -1,
              _id: -1,
            },
            options: {
              name: "grepedia__tool__status_upvotes_desc_downvotes_desc_id_desc",
            },
          },
          {
            key: { status: 1, owner: 1, _id: -1 },
            options: { name: "grepedia__tool__status_owner_id_desc" },
          },
          {
            key: { status: 1, categories: 1, name: 1, _id: 1 },
            options: {
              name: "grepedia__tool__status_categories_name_id",
            },
          },
          {
            key: { owner: 1 },
            options: { name: "grepedia__tool__owner" },
          },
          {
            key: { addedBy: 1 },
            options: { name: "grepedia__tool__addedBy" },
          },
          {
            key: { updatedBy: 1 },
            options: { name: "grepedia__tool__updatedBy" },
          },
          {
            key: { slug: 1 },
            options: { name: "grepedia__tool__slug_unique", unique: true },
          },
        ],
      }),
      fastify.syncIndexes({
        collection: toolReactionCollection,
        mode: "reconcile",
        specs: [
          {
            key: { toolId: 1, userId: 1 },
            options: {
              name: "grepedia__tool_reaction__toolId_userId",
              unique: true,
            },
          },
          {
            key: { toolId: 1, value: 1 },
            options: { name: "grepedia__tool_reaction__toolId_value" },
          },
          {
            key: { userId: 1, value: 1 },
            options: { name: "grepedia__tool_reaction__userId_value" },
          },
          {
            key: { userId: 1, toolId: 1 },
            options: { name: "grepedia__tool_reaction__userId_toolId" },
          },
        ],
      }),
      fastify.syncIndexes({
        collection: toolCommentCollection,
        mode: "reconcile",
        specs: [
          {
            key: { toolId: 1, createdAt: -1 },
            options: { name: "grepedia__tool_comment__toolId_createdAt_desc" },
          },
          {
            key: { toolId: 1, parentCommentId: 1, createdAt: -1, _id: -1 },
            options: {
              name: "grepedia__tool_comment__toolId_parentCommentId_createdAt_desc_id_desc",
            },
          },
          {
            key: { parentCommentId: 1, createdAt: -1, _id: -1 },
            options: {
              name: "grepedia__tool_comment__parentCommentId_createdAt_desc_id_desc",
            },
          },
          {
            key: { userId: 1, createdAt: -1 },
            options: { name: "grepedia__tool_comment__userId_createdAt_desc" },
          },
        ],
      }),
      fastify.syncIndexes({
        collection: toolCommentReactionCollection,
        mode: "reconcile",
        specs: [
          {
            key: { commentId: 1, userId: 1 },
            options: {
              name: "grepedia__tool_comment_reaction__commentId_userId",
              unique: true,
            },
          },
          {
            key: { commentId: 1, value: 1 },
            options: {
              name: "grepedia__tool_comment_reaction__commentId_value",
            },
          },
          {
            key: { userId: 1, commentId: 1 },
            options: {
              name: "grepedia__tool_comment_reaction__userId_commentId",
            },
          },
        ],
      }),
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
  { dependencies: ["mongodb", "sync-indexes"], name: "database" },
);
