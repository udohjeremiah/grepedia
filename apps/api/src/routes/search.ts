import type { ToolWithObjectIds } from "@/schemas/tool.js";
import { convertObjectIdsToStrings } from "@/utils/convert-objectids-to-string.js";
import { omitKeys } from "@workspace/shared/omit-keys";
import {
  search200ResponseSchema,
  searchQueryStringSchema,
} from "@workspace/shared/schemas/search";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { ObjectId } from "mongodb";
import { z } from "zod";

type CursorPayload =
  | { type: "id"; id: string }
  | { type: "score"; score: number; id: string }
  | { type: "date"; date: string; id: string };

const search: FastifyPluginAsyncZod = async (fastify) => {
  const encodeCursor = (cursor: CursorPayload) => {
    return Buffer.from(JSON.stringify(cursor)).toString("base64url");
  };

  const decodeCursor = (cursor?: string): CursorPayload | null => {
    if (!cursor) return null;
    return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
  };

  fastify.route({
    method: "GET",
    url: "/search",
    schema: {
      querystring: searchQueryStringSchema,
      response: {
        default: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.unknown().optional(),
        }),
        200: search200ResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const { query, tab, limit = 20, cursor } = request.query;
      const decodedCursor = decodeCursor(cursor);
      const tools = fastify.getToolCollection();

      const words = query
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => new RegExp(w, "i"));

      const baseFilter = {
        status: "published",
        $or: [
          { name: { $in: words } },
          { short_description: { $in: words } },
          { long_description: { $in: words } },
          { categories: { $in: words } },
          { tags: { $in: words } },
        ],
      };

      const idCursorMatch =
        decodedCursor?.type === "id"
          ? { _id: { $lt: new ObjectId(decodedCursor.id) } }
          : null;

      const scoreCursorMatch =
        decodedCursor?.type === "score"
          ? {
              $or: [
                { score: { $lt: decodedCursor.score } },
                {
                  score: decodedCursor.score,
                  _id: { $lt: new ObjectId(decodedCursor.id) },
                },
              ],
            }
          : null;

      const dateCursorMatch =
        decodedCursor?.type === "date"
          ? {
              $or: [
                { released_at: { $lt: new Date(decodedCursor.date) } },
                {
                  released_at: new Date(decodedCursor.date),
                  _id: { $lt: new ObjectId(decodedCursor.id) },
                },
              ],
            }
          : null;

      const pipelines = {
        all: [
          { $match: baseFilter },
          ...(idCursorMatch ? [{ $match: idCursorMatch }] : []),
          { $sort: { _id: -1 } },
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
          { $sort: { score: -1, _id: -1 } },
          { $limit: limit },
        ],
        trending: [
          { $match: baseFilter },
          ...(idCursorMatch ? [{ $match: idCursorMatch }] : []),
          { $sort: { "stats.comments": -1, _id: -1 } },
          { $limit: limit },
        ],
        verified: [
          { $match: { ...baseFilter, owner: { $ne: null } } },
          ...(idCursorMatch ? [{ $match: idCursorMatch }] : []),
          { $sort: { _id: -1 } },
          { $limit: limit },
        ],
        new: [
          { $match: baseFilter },
          ...(dateCursorMatch ? [{ $match: dateCursorMatch }] : []),
          { $sort: { released_at: -1, _id: -1 } },
          { $limit: limit },
        ],
      };

      const result = await tools
        .aggregate<ToolWithObjectIds>(pipelines[tab])
        .toArray();

      const searchResults = result.map((tool) => {
        const converted = convertObjectIdsToStrings(
          omitKeys(tool, ["vectorEmbeddings"]),
        );
        return { ...converted, _id: converted._id! };
      });

      const last = result.at(-1);
      let nextCursor: string | null = null;

      if (last) {
        if (tab === "popular") {
          nextCursor = encodeCursor({
            type: "score",
            score: last.stats.upvotes - last.stats.downvotes,
            id: last._id!.toString(),
          });
        } else if (tab === "new" && last.released_at) {
          nextCursor = encodeCursor({
            type: "date",
            date: last.released_at,
            id: last._id!.toString(),
          });
        } else {
          nextCursor = encodeCursor({
            type: "id",
            id: last._id!.toString(),
          });
        }
      }

      return reply.send({
        success: true,
        message: "Search results retrieved successfully",
        data: { tools: searchResults, nextCursor },
      });
    },
  });
};

export default search;
