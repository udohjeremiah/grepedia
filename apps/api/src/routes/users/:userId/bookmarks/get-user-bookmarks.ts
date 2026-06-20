import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { Document } from "mongodb";

import { objectIdSchema } from "@workspace/shared/schemas/object-id";
import {
  getUserBookmarksParamsSchema,
  getUserBookmarksQueryStringSchema,
  getUserBookmarksResponseSchemas,
} from "@workspace/shared/schemas/users/bookmarks/get-user-bookmarks";
import { ObjectId } from "mongodb";
import { z } from "zod";

import {
  decodeCursor,
  encodeCursor,
  InvalidCursorError,
} from "@/utils/cursor.js";

const bookmarkCursorSchema = z.object({
  createdAt: z.string(),
  id: objectIdSchema,
});

type BookmarkCursor = z.infer<typeof bookmarkCursorSchema>;

const getUserBookmarks: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { userId } = request.params;
      const { cursor, limit = 20 } = request.query;

      const users = fastify.db.users;
      const userBookmarks = fastify.db.userBookmarks;
      const tools = fastify.db.tools;

      const userObjectId = ObjectId.createFromHexString(userId);

      const user = await users.findOne({ _id: userObjectId });

      if (!user) {
        return reply.code(404).send({
          message: "User not found",
          success: false,
        });
      }

      let decodedCursor: BookmarkCursor | undefined;
      try {
        decodedCursor = decodeCursor(cursor, bookmarkCursorSchema);
      } catch (error) {
        if (error instanceof InvalidCursorError) {
          return reply.code(400).send({
            message: "Invalid cursor",
            success: false,
          });
        }
        throw error;
      }

      const filter: Document = { userId: userObjectId };

      if (decodedCursor) {
        filter["$or"] = [
          { createdAt: { $lt: new Date(decodedCursor.createdAt) } },
          {
            _id: { $lt: ObjectId.createFromHexString(decodedCursor.id) },
            createdAt: new Date(decodedCursor.createdAt),
          },
        ];
      }

      const bookmarkDocuments = await userBookmarks
        // eslint-disable-next-line unicorn/no-array-callback-reference
        .find(filter)
        // eslint-disable-next-line perfectionist/sort-objects
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit)
        .toArray();

      const uniqueToolIds = [
        ...new Set(
          bookmarkDocuments.map((bookmark) => bookmark.toolId.toString()),
        ),
      ].map((toolId) => ObjectId.createFromHexString(toolId));

      const toolDocuments = await tools
        .find(
          { _id: { $in: uniqueToolIds } },
          {
            projection: {
              _id: 1,
              categories: 1,
              name: 1,
              officialUrl: 1,
              shortDescription: 1,
              slug: 1,
            },
          },
        )
        .toArray();

      const toolMap = new Map(
        toolDocuments.map((tool) => [tool._id.toString(), tool] as const),
      );

      const bookmarks = bookmarkDocuments.flatMap((bookmark) => {
        const tool = toolMap.get(bookmark.toolId.toString());
        if (!tool) return [];

        return [
          {
            _id: bookmark._id.toString(),
            bookmarkedAt: bookmark.createdAt.toISOString(),
            categories: tool.categories,
            name: tool.name,
            officialUrl: tool.officialUrl,
            shortDescription: tool.shortDescription,
            slug: tool.slug,
          },
        ];
      });

      let nextCursor: string | undefined;
      const lastBookmark = bookmarkDocuments.at(-1);

      if (lastBookmark && bookmarkDocuments.length === limit) {
        nextCursor = encodeCursor({
          _id: lastBookmark._id.toHexString(),
          createdAt: lastBookmark.createdAt.toISOString(),
        });
      }

      return reply.code(200).send({
        data: { bookmarks, nextCursor },
        message: "User bookmarks retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    onRequest: [fastify.requireUserId()],
    schema: {
      params: getUserBookmarksParamsSchema,
      querystring: getUserBookmarksQueryStringSchema,
      response: getUserBookmarksResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Users"],
    },
    url: "/",
  });
};

export default getUserBookmarks;
