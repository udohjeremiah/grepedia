import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  removeUserBookmarkParamsSchema,
  removeUserBookmarkResponseSchemas,
} from "@workspace/shared/schemas/users/bookmarks/remove-user-bookmark";
import { ObjectId } from "mongodb";

const removeUserBookmark: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { bookmarkId, userId } = request.params;

      if (!ObjectId.isValid(bookmarkId)) {
        return reply.code(400).send({
          message: "Invalid bookmark id",
          success: false,
        });
      }

      const users = fastify.db.users;
      const userBookmarks = fastify.db.userBookmarks;

      const userObjectId = ObjectId.createFromHexString(userId);
      const user = await users.findOne({ _id: userObjectId });

      if (!user) {
        return reply.code(404).send({
          message: "User not found",
          success: false,
        });
      }

      const bookmarkObjectId = ObjectId.createFromHexString(bookmarkId);

      const deleteResult = await userBookmarks.deleteOne({
        _id: bookmarkObjectId,
        userId: userObjectId,
      });

      if (!deleteResult.acknowledged) {
        return reply.code(500).send({
          message: "Internal server error",
          success: false,
        });
      }

      if (deleteResult.deletedCount === 0) {
        return reply.code(404).send({
          message: "Bookmark not found",
          success: false,
        });
      }

      return reply.code(200).send({
        data: { bookmarkId },
        message: "Bookmark removed successfully",
        success: true,
      });
    },
    method: "DELETE",
    onRequest: [fastify.requireUserId()],
    schema: {
      params: removeUserBookmarkParamsSchema,
      response: removeUserBookmarkResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Users"],
    },
    url: "/",
  });
};

export default removeUserBookmark;
