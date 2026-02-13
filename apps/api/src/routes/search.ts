import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { omitKeys } from "@workspace/shared/omit-keys";
import {
  searchQueryStringSchema,
  searchResponseSchemas,
} from "@workspace/shared/schemas/search";
import { ObjectId } from "mongodb";

import type { ToolWithObjectIds } from "@/schemas/tools/tool.js";

import { decodeCursor, encodeCursor } from "@/utils/cursor-codec.js";
import { serializeMongoTypes } from "@/utils/serialize-mongo-types.js";

const search: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async (request, reply) => {
      const { cursor, limit = 20, query, tab } = request.query;
      const decodedCursor = decodeCursor(cursor);
      const tools = fastify.getToolCollection();

      const words = query
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => new RegExp(w, "i"));

      const baseFilter = {
        $or: [
          { name: { $in: words } },
          { short_description: { $in: words } },
          { long_description: { $in: words } },
          { categories: { $in: words } },
          { tags: { $in: words } },
        ],
        status: "published",
      };

      const idCursorMatch =
        decodedCursor?.type === "id"
          ? { _id: { $lt: ObjectId.createFromHexString(decodedCursor.id) } }
          : undefined;

      const scoreCursorMatch =
        decodedCursor?.type === "score"
          ? {
              $or: [
                { score: { $lt: decodedCursor.score } },
                {
                  _id: { $lt: ObjectId.createFromHexString(decodedCursor.id) },
                  score: decodedCursor.score,
                },
              ],
            }
          : undefined;

      const dateCursorMatch =
        decodedCursor?.type === "date"
          ? {
              $or: [
                { released_at: { $lt: new Date(decodedCursor.date) } },
                {
                  _id: { $lt: ObjectId.createFromHexString(decodedCursor.id) },
                  released_at: new Date(decodedCursor.date),
                },
              ],
            }
          : undefined;

      const pipelines = {
        all: [
          { $match: baseFilter },
          ...(idCursorMatch ? [{ $match: idCursorMatch }] : []),
          { $sort: { _id: -1 } },
          { $limit: limit },
        ],
        new: [
          { $match: baseFilter },
          ...(dateCursorMatch ? [{ $match: dateCursorMatch }] : []),
          { $sort: { _id: -1, released_at: -1 } },
          { $limit: limit },
        ],
        popular: [
          { $match: baseFilter },
          {
            $addFields: {
              score: { $subtract: ["$stats.upvotes", "$stats.downvotes"] },
            },
          },
          ...(scoreCursorMatch ? [{ $match: scoreCursorMatch }] : []),
          { $sort: { _id: -1, score: -1 } },
          { $limit: limit },
        ],
        trending: [
          { $match: baseFilter },
          ...(idCursorMatch ? [{ $match: idCursorMatch }] : []),
          { $sort: { _id: -1, "stats.comments": -1 } },
          { $limit: limit },
        ],
        verified: [
          { $match: { ...baseFilter, owner: { $exists: true } } },
          ...(idCursorMatch ? [{ $match: idCursorMatch }] : []),
          { $sort: { _id: -1 } },
          { $limit: limit },
        ],
      };

      const result = await tools
        .aggregate<ToolWithObjectIds>(pipelines[tab])
        .toArray();

      const searchResults = result.map((tool) => {
        const converted = serializeMongoTypes(
          omitKeys(tool, ["vectorEmbeddings"]),
        );
        return { ...converted, _id: converted["_id"] };
      });

      const last = result.at(-1);
      let nextCursor: string | undefined;

      if (last) {
        if (tab === "popular") {
          nextCursor = encodeCursor({
            id: last._id!.toString(),
            score: last.stats.upvotes - last.stats.downvotes,
            type: "score",
          });
        } else if (tab === "new" && last.released_at) {
          nextCursor = encodeCursor({
            date: last.released_at,
            id: last._id!.toString(),
            type: "date",
          });
        } else {
          nextCursor = encodeCursor({
            id: last._id!.toString(),
            type: "id",
          });
        }
      }

      return reply.send({
        data: { nextCursor, tools: searchResults },
        message: "Search results retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    schema: {
      querystring: searchQueryStringSchema,
      response: searchResponseSchemas,
      tags: ["Search"],
    },
    url: "/search",
  });
};

export default search;
