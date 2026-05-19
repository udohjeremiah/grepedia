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

type Database = {
  instance: Db;
  moderationCases: Collection<ModerationCaseWithObjectIds>;
  toolCommentReactions: Collection<ToolCommentReactionWithObjectIds>;
  toolComments: Collection<ToolCommentWithObjectIds>;
  toolReactions: Collection<ToolReactionWithObjectIds>;
  toolRevisions: Collection<ToolRevisionWithObjectIds>;
  tools: Collection<ToolWithObjectIds>;
  userBookmarks: Collection<UserBookmarkWithObjectIds>;
  users: Collection<UserWithObjectIds>;
};

declare module "fastify" {
  interface FastifyInstance {
    db: Database;
  }
}

/**
 * This plugin initializes and exposes typed MongoDB
 * collections and syncs their indexes on startup.
 *
 * @see {@link https://www.mongodb.com/docs/drivers/node}
 */
export default fp(
  async (fastify) => {
    const instance = fastify.mongo?.db;
    if (!instance) {
      throw new Error("MongoDB database is not initialized");
    }

    const users = instance.collection<UserWithObjectIds>(
      fastify.env.MONGODB_COLL_USER,
    );

    const userBookmarks = instance.collection<UserBookmarkWithObjectIds>(
      fastify.env.MONGODB_COLL_USER_BOOKMARK,
    );

    const tools = instance.collection<ToolWithObjectIds>(
      fastify.env.MONGODB_COLL_TOOL,
    );

    const toolReactions = instance.collection<ToolReactionWithObjectIds>(
      fastify.env.MONGODB_COLL_TOOL_REACTION,
    );

    const toolComments = instance.collection<ToolCommentWithObjectIds>(
      fastify.env.MONGODB_COLL_TOOL_COMMENT,
    );

    const toolCommentReactions =
      instance.collection<ToolCommentReactionWithObjectIds>(
        fastify.env.MONGODB_COLL_TOOL_COMMENT_REACTION,
      );

    const toolRevisions = instance.collection<ToolRevisionWithObjectIds>(
      fastify.env.MONGODB_COLL_TOOL_REVISION,
    );

    const moderationCases = instance.collection<ModerationCaseWithObjectIds>(
      fastify.env.MONGODB_COLL_MODERATION_CASE,
    );

    fastify.addHook("onReady", async () => {
      await fastify.syncIndexes({
        db: instance,
        mode: "reconcile",
        targets: [
          {
            collection: userBookmarks,
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
            collection: tools,
            specs: [
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
              {
                key: { officialUrl: 1 },
                options: {
                  unique: true,
                  name: "grepedia__tool__official_url_unique",
                },
              },
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
            ],
          },
          {
            collection: toolReactions,
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
            collection: toolComments,
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
            collection: toolCommentReactions,
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
            collection: toolRevisions,
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
            collection: moderationCases,
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

    fastify.decorate("db", {
      instance,
      users,
      userBookmarks,
      tools,
      toolReactions,
      toolComments,
      toolCommentReactions,
      toolRevisions,
      moderationCases,
    });
  },
  { dependencies: ["sync-indexes"], name: "database" },
);
