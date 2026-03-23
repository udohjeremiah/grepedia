/* eslint-disable perfectionist/sort-objects */

import type { Collection, Db } from "mongodb";

import fp from "fastify-plugin";

import type { ModerationCaseWithObjectIds } from "@/schemas/moderation/moderation-case.js";
import type { ToolCommentReactionWithObjectIds } from "@/schemas/tools/tool-comment-reaction.js";
import type { ToolCommentWithObjectIds } from "@/schemas/tools/tool-comment.js";
import type { ToolReactionWithObjectIds } from "@/schemas/tools/tool-reaction.js";
import type { ToolRevisionWithObjectIds } from "@/schemas/tools/tool-revision.js";
import type { ToolWithObjectIds } from "@/schemas/tools/tool.js";
import type { UserBookmarkWithObjectIds } from "@/schemas/users/user-bookmark.js";
import type { UserWithObjectIds } from "@/schemas/users/user.js";

declare module "fastify" {
  interface FastifyInstance {
    getDatabase: () => Db;
    getModerationCaseCollection: () => Collection<ModerationCaseWithObjectIds>;
    getToolCollection: () => Collection<ToolWithObjectIds>;
    getToolCommentCollection: () => Collection<ToolCommentWithObjectIds>;
    getToolCommentReactionCollection: () => Collection<ToolCommentReactionWithObjectIds>;
    getToolReactionCollection: () => Collection<ToolReactionWithObjectIds>;
    getToolRevisionCollection: () => Collection<ToolRevisionWithObjectIds>;
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

    const toolRevisionCollection =
      database.collection<ToolRevisionWithObjectIds>(
        fastify.env.MONGODB_COLL_TOOL_REVISION,
      );

    const moderationCaseCollection =
      database.collection<ModerationCaseWithObjectIds>(
        fastify.env.MONGODB_COLL_MODERATION_CASE,
      );

    fastify.addHook("onReady", async () => {
      await fastify.syncIndexes({
        db: database,
        mode: "reconcile",
        targets: [
          {
            collection: userBookmarkCollection,
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
                options: {
                  name: "grepedia__user_bookmark__userId_createdAt_desc",
                },
              },
            ],
          },
          {
            collection: toolCollection,
            specs: [
              {
                key: { status: 1, _id: -1 },
                options: { name: "grepedia__tool__status_id_desc" },
              },
              {
                key: { status: 1, releasedAt: -1, _id: -1 },
                options: {
                  name: "grepedia__tool__status_releasedAt_desc_id_desc",
                },
              },
              {
                key: { status: 1, "stats.comments": -1, _id: -1 },
                options: {
                  name: "grepedia__tool__status_comments_desc_id_desc",
                },
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
                key: { status: 1, _id: -1 },
                options: { name: "grepedia__tool__status_id_desc" },
              },
              {
                key: { status: 1, categories: 1, name: 1, _id: 1 },
                options: {
                  name: "grepedia__tool__status_categories_name_id",
                },
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
          },
          {
            collection: toolReactionCollection,
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
          },
          {
            collection: toolCommentCollection,
            specs: [
              {
                key: { toolId: 1, createdAt: -1 },
                options: {
                  name: "grepedia__tool_comment__toolId_createdAt_desc",
                },
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
                options: {
                  name: "grepedia__tool_comment__userId_createdAt_desc",
                },
              },
            ],
          },
          {
            collection: toolCommentReactionCollection,
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
          },
          {
            collection: toolRevisionCollection,
            specs: [
              {
                key: { toolId: 1, revisionNumber: -1, _id: -1 },
                options: {
                  name: "grepedia__tool_revision__toolId_revisionNumber_desc_id_desc",
                  unique: true,
                },
              },
              {
                key: { toolId: 1, createdAt: -1, _id: -1 },
                options: {
                  name: "grepedia__tool_revision__toolId_createdAt_desc_id_desc",
                },
              },
            ],
          },
          {
            collection: moderationCaseCollection,
            specs: [
              {
                key: { discussionUrl: 1 },
                options: {
                  name: "grepedia__moderation_case__discussionUrl_unique",
                  unique: true,
                },
              },
              {
                key: { status: 1, type: 1, createdAt: -1, _id: -1 },
                options: {
                  name: "grepedia__moderation_case__status_type_createdAt_desc_id_desc",
                },
              },
              {
                key: { userId: 1, type: 1, status: 1, createdAt: -1 },
                options: {
                  name: "grepedia__moderation_case__userId_type_status_createdAt_desc",
                },
              },
              {
                key: { toolId: 1, type: 1, status: 1, createdAt: -1 },
                options: {
                  name: "grepedia__moderation_case__toolId_type_status_createdAt_desc",
                },
              },
            ],
          },
        ],
      });
    });

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
    fastify.decorate("getToolRevisionCollection", () => toolRevisionCollection);
    fastify.decorate(
      "getModerationCaseCollection",
      () => moderationCaseCollection,
    );
  },
  { dependencies: ["mongodb", "sync-indexes"], name: "database" },
);
