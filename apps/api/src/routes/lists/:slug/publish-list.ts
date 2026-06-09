import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  publishListParamsSchema,
  publishListResponseSchemas,
} from "@workspace/shared/schemas/lists/publish-list";
import { ObjectId } from "mongodb";

const publishList: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      if (!request.user) throw new Error("User not authenticated");

      const { slug } = request.params;

      const lists = fastify.db.lists;

      const userId = ObjectId.createFromHexString(request.user.id);
      const now = new Date();

      const updateResult = await lists.findOneAndUpdate(
        {
          createdBy: userId,
          slug,
          status: "draft",
          "tools.0": { $exists: true },
        },
        {
          $set: {
            publishedAt: now,
            status: "published",
            updatedAt: now,
          },
        },
        { returnDocument: "after" },
      );

      if (!updateResult) {
        return reply.code(404).send({
          message: "Draft list not found",
          success: false,
        });
      }

      return reply.code(200).send({
        data: {
          listId: updateResult._id.toString(),
          listSlug: updateResult.slug,
          publishedAt: now.toISOString(),
        },
        message: "List published successfully",
        success: true,
      });
    },
    method: "POST",
    onRequest: [fastify.requireStatus("active")],
    schema: {
      params: publishListParamsSchema,
      response: publishListResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Lists"],
    },
    url: "/",
  });
};

export default publishList;
