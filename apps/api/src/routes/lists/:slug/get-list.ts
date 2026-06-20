import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { Collection, Document } from "mongodb";

import {
  getListParamsSchema,
  getListQueryStringSchema,
  getListResponseSchemas,
} from "@workspace/shared/schemas/lists/get-list";
import { omitKeys } from "@workspace/shared/utils/omit-keys";
import { ObjectId } from "mongodb";
import { z } from "zod";

import type { ToolWithObjectIds } from "@/schemas/tools/tool.js";

import {
  decodeCursor,
  encodeCursor,
  InvalidCursorError,
} from "@/utils/cursor.js";
import {
  getOfficialListBySlug,
  getPeriodEnd,
  getPeriodStart,
  OFFICIAL_LISTS,
} from "@/utils/official-lists.js";
import { serializeMongoTypes } from "@/utils/serialize-mongo-types.js";

const officialListToolsCursorSchema = z.object({
  id: z.string(),
  score: z.number(),
});

async function resolveOfficialListTools(
  tools: Collection<ToolWithObjectIds>,
  period: "month" | "today" | "week" | "yesterday",
  cursor: string | undefined,
  limit: number,
) {
  const periodStart = getPeriodStart(period);
  const periodEnd = getPeriodEnd(period);

  const filter: Document = {
    ["addedAt"]: periodEnd
      ? { $gte: periodStart, $lte: periodEnd }
      : { $gte: periodStart },
    status: "published",
  };

  const decodedCursor = decodeCursor(cursor, officialListToolsCursorSchema);

  const pipeline: Document[] = [
    { $match: filter },
    {
      $addFields: {
        score: { $subtract: ["$stats.upvotes", "$stats.downvotes"] },
      },
    },
    ...(decodedCursor
      ? [
          {
            $match: {
              $or: [
                { score: { $lt: decodedCursor.score } },
                {
                  _id: { $lt: ObjectId.createFromHexString(decodedCursor.id) },
                  score: decodedCursor.score,
                },
              ],
            },
          },
        ]
      : []),
    // eslint-disable-next-line perfectionist/sort-objects
    { $sort: { score: -1, _id: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        categories: 1,
        name: 1,
        officialUrl: 1,
        score: 1,
        shortDescription: 1,
        slug: 1,
        stats: 1,
        tags: 1,
      },
    },
  ];

  const toolDocuments = await tools
    .aggregate<ToolWithObjectIds & { _id: ObjectId; score: number }>(pipeline)
    .toArray();

  let nextCursor: string | undefined;
  const lastTool = toolDocuments.at(-1);

  if (lastTool && toolDocuments.length === limit) {
    nextCursor = encodeCursor({
      id: lastTool._id.toHexString(),
      score: lastTool.score,
    });
  }

  return { nextCursor, toolDocuments };
}

const getList: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    // eslint-disable-next-line sonarjs/cognitive-complexity
    handler: async function (request, reply) {
      const { slug } = request.params;
      const { cursor, limit = 20 } = request.query;

      const lists = fastify.db.lists;
      const listViews = fastify.db.listViews;
      const listReactions = fastify.db.listReactions;
      const tools = fastify.db.tools;

      const officialList = getOfficialListBySlug(slug);

      if (officialList) {
        try {
          const { nextCursor, toolDocuments } = await resolveOfficialListTools(
            tools,
            officialList.period,
            cursor,
            limit,
          );

          const now = new Date();

          const listResponse = {
            _id: `00000000000000000000000${OFFICIAL_LISTS.indexOf(officialList) + 1}`,
            createdAt: now.toISOString(),
            createdBy: "000000000000000000000000",
            description: officialList.description,
            isOfficial: true,
            slug: officialList.slug,
            stats: { downvotes: 0, upvotes: 0, views: 0 },
            status: "published" as const,
            title: officialList.title,
          };

          return reply.code(200).send({
            data: {
              list: listResponse,
              nextCursor,
              tools: serializeMongoTypes(toolDocuments),
            },
            message: "List retrieved successfully",
            success: true,
          });
        } catch (error) {
          if (error instanceof InvalidCursorError) {
            return reply.code(400).send({
              message: "Invalid cursor",
              success: false,
            });
          }
          throw error;
        }
      }

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

      const sortedTools = serializeMongoTypes(
        toolDocuments.toSorted((a, b) => {
          const positionA = listDocument.tools.find((tool) =>
            tool.toolId.equals(a._id),
          )?.position;

          const positionB = listDocument.tools.find((tool) =>
            tool.toolId.equals(b._id),
          )?.position;

          return (positionA ?? 0) - (positionB ?? 0);
        }),
      );

      const listResponse = serializeMongoTypes({
        ...omitKeys(listDocument, ["tools"]),
        relations: { reaction: reactionDocument?.value },
      });

      return reply.code(200).send({
        data: { list: listResponse, tools: sortedTools },
        message: "List retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    onRequest: [fastify.setUserIfPresent],
    schema: {
      params: getListParamsSchema,
      querystring: getListQueryStringSchema,
      response: getListResponseSchemas,
      tags: ["Lists"],
    },
    url: "/",
  });
};

export default getList;
