import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  toggleArchiveListParamsSchema,
  toggleArchiveListResponseSchemas,
} from "@workspace/shared/schemas/lists/toggle-archive-list";
import { ObjectId } from "mongodb";

const toggleArchiveList: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      if (!request.user) throw new Error("User not authenticated");

      const { slug } = request.params;

      const lists = fastify.db.lists;

      const userId = ObjectId.createFromHexString(request.user.id);
      const list = await lists.findOne({
        createdBy: userId,
        slug,
        status: { $in: ["archived", "published"] },
      });

      if (!list) {
        return reply.code(404).send({
          message: "List not found",
          success: false,
        });
      }

      const now = new Date();
      const isArchived = list.status === "archived";

      const updateResult = await lists.findOneAndUpdate(
        { _id: list._id },
        isArchived
          ? {
              $set: {
                publishedAt: list.publishedAt ?? now,
                status: "published",
                updatedAt: now,
              },
              $unset: { archivedAt: "" },
            }
          : {
              $set: {
                archivedAt: now,
                status: "archived",
                updatedAt: now,
              },
            },
        { returnDocument: "after" },
      );

      if (!updateResult) {
        return reply.code(500).send({
          message: "Internal server error",
          success: false,
        });
      }

      return reply.code(200).send({
        data: {
          archivedAt: updateResult.archivedAt?.toISOString(),
          status: updateResult.status,
        },
        message: isArchived
          ? "List unarchived successfully"
          : "List archived successfully",
        success: true,
      });
    },
    method: "PATCH",
    onRequest: [fastify.requireStatus("active")],
    schema: {
      params: toggleArchiveListParamsSchema,
      response: toggleArchiveListResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Lists"],
    },
    url: "/",
  });
};

export default toggleArchiveList;
