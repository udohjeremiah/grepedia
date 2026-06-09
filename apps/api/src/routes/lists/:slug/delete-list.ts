import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  deleteListParamsSchema,
  deleteListResponseSchemas,
} from "@workspace/shared/schemas/lists/delete-list";
import { ObjectId } from "mongodb";

const archiveList: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      if (!request.user) throw new Error("User not authenticated");

      const { slug } = request.params;

      const lists = fastify.db.lists;

      const userId = ObjectId.createFromHexString(request.user.id);
      const list = await lists.findOne({ createdBy: userId, slug });

      if (!list) {
        return reply.code(404).send({
          message: "List not found",
          success: false,
        });
      }

      if (list.status !== "draft") {
        return reply.code(409).send({
          message: "You can only delete draft lists",
          success: false,
        });
      }

      const deleteListResult = await lists.deleteOne({
        createdBy: userId,
        slug,
      });

      if (!deleteListResult.acknowledged) {
        return reply.code(500).send({
          message: "Internal server error",
          success: false,
        });
      }

      if (deleteListResult.deletedCount === 0) {
        return reply.code(404).send({
          message: "List not found",
          success: false,
        });
      }

      return reply.code(200).send({
        data: { listId: list._id.toString() },
        message: "List deleted successfully",
        success: true,
      });
    },
    method: "DELETE",
    onRequest: [fastify.requireStatus("active")],
    schema: {
      params: deleteListParamsSchema,
      response: deleteListResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Lists"],
    },
    url: "/",
  });
};

export default archiveList;
