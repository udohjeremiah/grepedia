import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { Collection, Document } from "mongodb";

import {
  getListsQueryStringSchema,
  getListsResponseSchemas,
} from "@workspace/shared/schemas/lists/get-lists";
import { objectIdSchema } from "@workspace/shared/schemas/object-id";
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

const communityListsCursorSchema = z.object({
  downvotes: z.number(),
  id: objectIdSchema,
  publishedAt: z.string(),
  upvotes: z.number(),
});

type CommunityListsCursor = z.infer<typeof communityListsCursorSchema>;

const userListsCursorSchema = z.object({
  createdAt: z.string(),
  id: objectIdSchema,
  updatedAt: z.string(),
});

type UserListsCursor = z.infer<typeof userListsCursorSchema>;

const getLists: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    // eslint-disable-next-line sonarjs/cognitive-complexity
    handler: async function (request, reply) {
      const { createdBy, cursor, limit = 20 } = request.query;

      const lists = fastify.db.lists;
      const tools = fastify.db.tools;

      if (createdBy) {
        let decodedCursor: undefined | UserListsCursor;
        try {
          decodedCursor = decodeCursor(cursor, userListsCursorSchema);
        } catch (error) {
          if (error instanceof InvalidCursorError) {
            return reply.code(400).send({
              message: "Invalid cursor",
              success: false,
            });
          }
          throw error;
        }

        const filter: Document = {
          createdBy: ObjectId.createFromHexString(createdBy),
        };

        if (decodedCursor) {
          filter["$or"] = [
            { createdAt: { $lt: new Date(decodedCursor.createdAt) } },
            {
              createdAt: new Date(decodedCursor.createdAt),
              updatedAt: { $lt: new Date(decodedCursor.updatedAt) },
            },
            {
              createdAt: new Date(decodedCursor.createdAt),
              updatedAt: new Date(decodedCursor.updatedAt),
              // eslint-disable-next-line perfectionist/sort-objects
              _id: { $lt: ObjectId.createFromHexString(decodedCursor.id) },
            },
          ];
        }

        const listDocuments = await lists
          // eslint-disable-next-line unicorn/no-array-callback-reference
          .find(filter)
          // eslint-disable-next-line perfectionist/sort-objects
          .sort({ createdAt: -1, updatedAt: -1, _id: -1 })
          .limit(limit)
          .toArray();

        const listsResponse = listDocuments.map((list) => {
          const result = serializeMongoTypes(list);
          return {
            ...omitKeys(result, ["tools"]),
            toolCount: result.tools.length,
          };
        });

        let nextCursor: string | undefined;
        const lastList = listsResponse.at(-1);

        if (lastList && listsResponse.length === limit) {
          nextCursor = encodeCursor({
            createdAt: lastList.createdAt,
            id: lastList._id,
            updatedAt: lastList.updatedAt ?? lastList.createdAt,
          });
        }

        return reply.code(200).send({
          data: { lists: listsResponse, nextCursor },
          message: "Lists retrieved successfully",
          success: true,
        });
      }

      const now = new Date();

      const officialListsResponse = cursor
        ? []
        : await Promise.all(
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

      let decodedCursor: CommunityListsCursor | undefined;
      try {
        decodedCursor = decodeCursor(cursor, communityListsCursorSchema);
      } catch (error) {
        if (error instanceof InvalidCursorError) {
          return reply.code(400).send({
            message: "Invalid cursor",
            success: false,
          });
        }
        throw error;
      }

      const communityFilter: Document = { status: "published" };

      if (decodedCursor) {
        communityFilter["$or"] = [
          { "stats.upvotes": { $lt: decodedCursor.upvotes } },
          {
            "stats.downvotes": { $gt: decodedCursor.downvotes },
            "stats.upvotes": decodedCursor.upvotes,
          },
          {
            "stats.upvotes": decodedCursor.upvotes,
            // eslint-disable-next-line perfectionist/sort-objects
            "stats.downvotes": decodedCursor.downvotes,
            // eslint-disable-next-line perfectionist/sort-objects
            publishedAt: { $lt: new Date(decodedCursor.publishedAt) },
          },
          {
            "stats.upvotes": decodedCursor.upvotes,
            // eslint-disable-next-line perfectionist/sort-objects
            "stats.downvotes": decodedCursor.downvotes,
            // eslint-disable-next-line perfectionist/sort-objects
            publishedAt: new Date(decodedCursor.publishedAt),
            // eslint-disable-next-line perfectionist/sort-objects
            _id: { $lt: ObjectId.createFromHexString(decodedCursor.id) },
          },
        ];
      }

      const userListDocuments = await lists
        // eslint-disable-next-line unicorn/no-array-callback-reference
        .find(communityFilter)
        .sort({
          "stats.upvotes": -1,
          // eslint-disable-next-line perfectionist/sort-objects
          "stats.downvotes": 1,
          // eslint-disable-next-line perfectionist/sort-objects
          publishedAt: -1,
          // eslint-disable-next-line perfectionist/sort-objects
          _id: -1,
        })
        .limit(limit)
        .toArray();

      const communityListsResponse = userListDocuments.map((list) => {
        const result = serializeMongoTypes(list);
        return {
          ...omitKeys(result, ["tools"]),
          toolCount: result.tools.length,
        };
      });

      let nextCursor: string | undefined;
      const lastCommunityList = communityListsResponse.at(-1);

      if (lastCommunityList && communityListsResponse.length === limit) {
        nextCursor = encodeCursor({
          downvotes: lastCommunityList.stats.downvotes,
          id: lastCommunityList._id,
          publishedAt: lastCommunityList.publishedAt,
          upvotes: lastCommunityList.stats.upvotes,
        });
      }

      return reply.code(200).send({
        data: {
          lists: [...officialListsResponse, ...communityListsResponse],
          nextCursor,
        },
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
