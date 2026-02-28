import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  toggleToolBookmarkParamsSchema,
  toggleToolBookmarkResponseSchemas,
} from "@workspace/shared/schemas/tools/toggle-tool-bookmark";
import { ObjectId } from "mongodb";

const toggleToolBookmark: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      if (!request.user) throw new Error("User not authenticated");

      const { slug } = request.params;

      const tools = fastify.getToolCollection();
      const userBookmarks = fastify.getUserBookmarkCollection();

      const tool = await tools.findOne({ slug }, { projection: { _id: 1 } });

      if (!tool) {
        return reply.code(404).send({
          message: "Tool not found",
          success: false,
        });
      }

      const userId = ObjectId.createFromHexString(request.user.id);
      const existingBookmark = await userBookmarks.findOne({
        toolId: tool._id,
        userId,
      });

      if (existingBookmark) {
        const deleteResult = await userBookmarks.deleteOne({
          _id: existingBookmark._id,
        });

        if (!deleteResult.acknowledged) {
          return reply.code(500).send({
            message: "Internal server error",
            success: false,
          });
        }

        return reply.code(200).send({
          data: { bookmarked: false },
          message: "Bookmark removed successfully",
          success: true,
        });
      }

      const insertResult = await userBookmarks.insertOne({
        createdAt: new Date(),
        toolId: tool._id,
        userId,
      });

      if (!insertResult.acknowledged) {
        return reply.code(500).send({
          message: "Internal server error",
          success: false,
        });
      }

      return reply.code(200).send({
        data: {
          bookmarked: true,
          bookmarkId: insertResult.insertedId.toString(),
        },
        message: "Bookmark added successfully",
        success: true,
      });
    },
    method: "POST",
    onRequest: [fastify.requireUser],
    schema: {
      params: toggleToolBookmarkParamsSchema,
      response: toggleToolBookmarkResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Tools"],
    },
    url: "/bookmark",
  });
};

export default toggleToolBookmark;
