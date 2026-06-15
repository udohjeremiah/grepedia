import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { Collection } from "mongodb";

import {
  getListsQueryStringSchema,
  getListsResponseSchemas,
} from "@workspace/shared/schemas/lists/get-lists";
import { omitKeys } from "@workspace/shared/utils/omit-keys";
import { ObjectId } from "mongodb";

import type { ToolWithObjectIds } from "@/schemas/tools/tool.js";

import {
  getPeriodEnd,
  getPeriodStart,
  OFFICIAL_LISTS,
} from "@/utils/official-lists.js";
import { serializeMongoTypes } from "@/utils/serialize-mongo-types.js";

async function getOfficialToolCount(
  tools: Collection<ToolWithObjectIds>,
  period: "month" | "today" | "week" | "yesterday",
) {
  const periodStart = getPeriodStart(period);
  const periodEnd = getPeriodEnd(period);

  const filter: Record<string, unknown> = {
    ["addedAt"]: periodEnd
      ? { $gte: periodStart, $lte: periodEnd }
      : { $gte: periodStart },
    status: "published",
  };

  return tools.countDocuments(filter);
}

const getLists: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { createdBy } = request.query;

      const lists = fastify.db.lists;
      const tools = fastify.db.tools;

      if (createdBy) {
        const listDocuments = await lists
          .find({ createdBy: ObjectId.createFromHexString(createdBy) })
          .sort({ createdAt: -1, updatedAt: -1 })
          .limit(50)
          .toArray();

        const listsResponse = listDocuments.map((list) => {
          const result = serializeMongoTypes(list);
          return {
            ...omitKeys(result, ["tools"]),
            toolCount: result.tools.length,
          };
        });

        return reply.code(200).send({
          data: { lists: listsResponse },
          message: "Lists retrieved successfully",
          success: true,
        });
      }

      const now = new Date();

      const officialListsResponse = await Promise.all(
        OFFICIAL_LISTS.map(async (officialList, index) => {
          const toolCount = await getOfficialToolCount(
            tools,
            officialList.period,
          );

          return {
            _id: `00000000000000000000000${index + 1}`,
            createdAt: now.toISOString(),
            createdBy: "000000000000000000000000",
            description: officialList.description,
            isOfficial: true,
            slug: officialList.slug,
            stats: { downvotes: 0, upvotes: 0, views: 0 },
            status: "published",
            title: officialList.title,
            toolCount,
          } as const;
        }),
      );

      const userListDocuments = await lists
        .find({ status: "published" })
        .sort({
          "stats.upvotes": -1,
          // eslint-disable-next-line perfectionist/sort-objects
          "stats.downvotes": 1,
          // eslint-disable-next-line perfectionist/sort-objects
          publishedAt: -1,
          // eslint-disable-next-line perfectionist/sort-objects
          _id: -1,
        })
        .limit(50)
        .toArray();

      const userListsResponse = userListDocuments.map((list) => {
        const result = serializeMongoTypes(list);
        return {
          ...omitKeys(result, ["tools"]),
          toolCount: result.tools.length,
        };
      });

      const listsResponse = [...officialListsResponse, ...userListsResponse];

      return reply.code(200).send({
        data: { lists: listsResponse },
        message: "Lists retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    schema: {
      querystring: getListsQueryStringSchema,
      response: getListsResponseSchemas,
      tags: ["Lists"],
    },
    url: "/",
  });
};

export default getLists;
