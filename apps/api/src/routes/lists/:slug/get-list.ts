import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  getListParamsSchema,
  getListResponseSchemas,
} from "@workspace/shared/schemas/lists/get-list";
import { ObjectId } from "mongodb";

import { serializeMongoTypes } from "@/utils/serialize-mongo-types.js";

const getList: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { slug } = request.params;

      const lists = fastify.db.lists;
      const listViews = fastify.db.listViews;
      const listReactions = fastify.db.listReactions;
      const tools = fastify.db.tools;

      const list = await lists.findOne({ slug });

      if (!list) {
        return reply.code(404).send({
          message: "List not found",
          success: false,
        });
      }

      const userId = request.user?.id
        ? ObjectId.createFromHexString(request.user.id)
        : undefined;
      const isOwner = list.createdBy.equals(userId);
      const isPubliclyVisible = list.status !== "draft";

      if (!isPubliclyVisible && !isOwner) {
        return reply.code(404).send({
          message: "List not found",
          success: false,
        });
      }

      let listDocument = list;
      if (isPubliclyVisible && !isOwner) {
        const upsertResult = await listViews.updateOne(
          { ip: request.ip, listId: list._id },
          { $setOnInsert: { viewedAt: new Date() } },
          { upsert: true },
        );

        if (upsertResult.upsertedId) {
          const updateResult = await lists.updateOne(
            { _id: list._id },
            { $inc: { "stats.views": 1 } },
          );

          if (!updateResult.acknowledged) {
            return reply.code(500).send({
              message: "Internal server error",
              success: false,
            });
          }

          listDocument = {
            ...list,
            stats: { ...list.stats, views: list.stats.views + 1 },
          };
        }
      }

      const reactionDocument = userId
        ? await listReactions.findOne({ listId: list._id, userId })
        : undefined;

      const toolIds = listDocument.tools.map((tool) => tool.toolId);
      const toolDocuments = await tools
        .find(
          { _id: { $in: toolIds } },
          {
            projection: {
              _id: 1,
              categories: 1,
              name: 1,
              officialUrl: 1,
              shortDescription: 1,
              slug: 1,
              stats: 1,
              tags: 1,
            },
          },
        )
        .toArray();

      const listResponse = serializeMongoTypes({
        ...listDocument,
        relations: { reaction: reactionDocument?.value },
        tools: toolDocuments.toSorted((a, b) => {
          const positionA = listDocument.tools.find((tool) =>
            tool.toolId.equals(a._id),
          )?.position;

          const positionB = listDocument.tools.find((tool) =>
            tool.toolId.equals(b._id),
          )?.position;

          return (positionA ?? 0) - (positionB ?? 0);
        }),
      });

      return reply.code(200).send({
        data: { list: listResponse },
        message: "List retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    onRequest: [fastify.setUserIfPresent],
    schema: {
      params: getListParamsSchema,
      response: getListResponseSchemas,
      tags: ["Lists"],
    },
    url: "/",
  });
};

export default getList;
