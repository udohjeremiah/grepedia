import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  getUserBookmarksParamsSchema,
  getUserBookmarksResponseSchemas,
} from "@workspace/shared/schemas/users/bookmarks/get-user-bookmarks";
import { ObjectId } from "mongodb";

const getUserBookmarks: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { userId } = request.params;

      const users = fastify.db.users;
      const userBookmarks = fastify.db.userBookmarks;
      const tools = fastify.db.tools;

      const userObjectId = ObjectId.createFromHexString(userId);
      const [user, bookmarkDocuments] = await Promise.all([
        users.findOne({ _id: userObjectId }),
        userBookmarks
          .find({ userId: userObjectId })
          .sort({ createdAt: -1 })
          .toArray(),
      ]);

      if (!user) {
        return reply.code(404).send({
          message: "User not found",
          success: false,
        });
      }

      if (bookmarkDocuments.length === 0) {
        return reply.code(200).send({
          data: { bookmarks: [] },
          message: "User bookmarks retrieved successfully",
          success: true,
        });
      }

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

      return reply.code(200).send({
        data: { bookmarks },
        message: "User bookmarks retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    onRequest: [fastify.requireUserId()],
    schema: {
      params: getUserBookmarksParamsSchema,
      response: getUserBookmarksResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Users"],
    },
    url: "/",
  });
};

export default getUserBookmarks;
