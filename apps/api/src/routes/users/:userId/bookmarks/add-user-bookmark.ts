import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  addUserBookmarkBodySchema,
  addUserBookmarkParamsSchema,
  addUserBookmarkResponseSchemas,
} from "@workspace/shared/schemas/users/add-user-bookmark";
import { ObjectId } from "mongodb";

const addUserBookmark: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { userId } = request.params;
      const { toolId } = request.body;

      if (!ObjectId.isValid(toolId)) {
        return reply.code(400).send({
          message: "Invalid tool id",
          success: false,
        });
      }

      const users = fastify.getUserCollection();
      const tools = fastify.getToolCollection();
      const userBookmarks = fastify.getUserBookmarkCollection();

      const userObjectId = ObjectId.createFromHexString(userId);
      const toolObjectId = ObjectId.createFromHexString(toolId);

      const [user, tool, existingBookmark] = await Promise.all([
        users.findOne({ _id: userObjectId }),
        tools.findOne({ _id: toolObjectId }),
        userBookmarks.findOne({ toolId: toolObjectId, userId: userObjectId }),
      ]);

      if (!user) {
        return reply.code(404).send({
          message: "User not found",
          success: false,
        });
      }

      if (!tool) {
        return reply.code(404).send({
          message: "Tool not found",
          success: false,
        });
      }

      if (existingBookmark) {
        return reply.code(409).send({
          message: "Tool is already bookmarked",
          success: false,
        });
      }

      const bookmarkedAt = new Date().toISOString();
      const insertResult = await userBookmarks.insertOne({
        created_at: bookmarkedAt,
        toolId: toolObjectId,
        userId: userObjectId,
      });

      return reply.code(201).send({
        data: {
          bookmarkedAt,
          bookmarkId: insertResult.insertedId.toString(),
          toolId,
        },
        message: "Bookmark added successfully",
        success: true,
      });
    },
    method: "POST",
    onRequest: [fastify.requireUserId()],
    schema: {
      body: addUserBookmarkBodySchema,
      params: addUserBookmarkParamsSchema,
      response: addUserBookmarkResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Users"],
    },
    url: "/",
  });
};

export default addUserBookmark;
