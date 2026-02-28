import type { SearchQueryString } from "@workspace/shared/schemas/search";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { Document } from "mongodb";

import { objectIdSchema } from "@workspace/shared/schemas/object-id-schema";
import {
  searchQueryStringSchema,
  searchResponseSchemas,
} from "@workspace/shared/schemas/search";
import { ObjectId } from "mongodb";
import { z } from "zod";

import type { ToolWithObjectIds } from "@/schemas/tools/tool.js";

import {
  decodeCursor,
  encodeCursor,
  InvalidCursorError,
} from "@/utils/cursor.js";
import { serializeMongoTypes } from "@/utils/serialize-mongo-types.js";

type BuildSearchPipelineParams = {
  baseFilter: Record<string, unknown>;
  commentsCollectionName: string;
  cursorMatches: SearchCursorMatches;
  limit: number;
  tab: SearchTab;
  trendingWindowStart: Date;
};

type CursorPayload =
  | { comments: number; id: string; type: "comments" }
  | { date: string; id: string; type: "date" }
  | { id: string; score: number; type: "score" }
  | { id: string; type: "id" };

type GetNextSearchCursorParams = {
  last:
    | undefined
    | {
        _id?: ObjectId;
        recentComments?: number;
        releasedAt?: Date;
        stats: { downvotes: number; upvotes: number };
      };
  limit: number;
  tab: SearchTab;
};

type NextCursor =
  | undefined
  | { comments: number; id: string; type: "comments" }
  | { date: string; id: string; type: "date" }
  | { id: string; score: number; type: "score" }
  | { id: string; type: "id" };

type SearchCursorMatches = {
  commentsCursorMatch?: Record<string, unknown>;
  dateCursorMatch?: Record<string, unknown>;
  idCursorMatch?: Record<string, unknown>;
  scoreCursorMatch?: Record<string, unknown>;
};

type SearchTab = SearchQueryString["tab"];

const searchCursorPayloadSchema = z.discriminatedUnion("type", [
  z.object({
    date: z.iso.datetime(),
    id: objectIdSchema,
    type: z.literal("date"),
  }),
  z.object({
    comments: z.number(),
    id: objectIdSchema,
    type: z.literal("comments"),
  }),
  z.object({ id: objectIdSchema, score: z.number(), type: z.literal("score") }),
  z.object({ id: objectIdSchema, type: z.literal("id") }),
]);

function buildBaseSearchFilter(words: RegExp[]) {
  return {
    $or: [
      { name: { $in: words } },
      { shortDescription: { $in: words } },
      { longDescription: { $in: words } },
      { categories: { $in: words } },
      { tags: { $in: words } },
    ],
    status: "published",
  };
}

function buildCursorMatches(
  decodedCursor: CursorPayload | undefined,
): SearchCursorMatches {
  if (!decodedCursor) return {};

  if (decodedCursor.type === "id") {
    return {
      idCursorMatch: {
        _id: { $lt: ObjectId.createFromHexString(decodedCursor.id) },
      },
    };
  }

  if (decodedCursor.type === "score") {
    return {
      scoreCursorMatch: {
        $or: [
          { score: { $lt: decodedCursor.score } },
          {
            _id: { $lt: ObjectId.createFromHexString(decodedCursor.id) },
            score: decodedCursor.score,
          },
        ],
      },
    };
  }

  if (decodedCursor.type === "comments") {
    return {
      commentsCursorMatch: {
        $or: [
          { recentComments: { $lt: decodedCursor.comments } },
          {
            _id: { $lt: ObjectId.createFromHexString(decodedCursor.id) },
            recentComments: decodedCursor.comments,
          },
        ],
      },
    };
  }

  return {
    dateCursorMatch: {
      $or: [
        { releasedAt: { $lt: new Date(decodedCursor.date) } },
        {
          _id: { $lt: ObjectId.createFromHexString(decodedCursor.id) },
          releasedAt: new Date(decodedCursor.date),
        },
      ],
    },
  };
}

function buildSearchPipeline({
  baseFilter,
  commentsCollectionName,
  cursorMatches,
  limit,
  tab,
  trendingWindowStart,
}: BuildSearchPipelineParams): Document[] {
  const {
    commentsCursorMatch,
    dateCursorMatch,
    idCursorMatch,
    scoreCursorMatch,
  } = cursorMatches;

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
      // eslint-disable-next-line perfectionist/sort-objects
      { $sort: { releasedAt: -1, _id: -1 } },
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
      // eslint-disable-next-line perfectionist/sort-objects
      { $sort: { score: -1, _id: -1 } },
      { $limit: limit },
    ],
    trending: [
      { $match: baseFilter },
      {
        $lookup: {
          as: "recentCommentStats",
          from: commentsCollectionName,
          let: { toolId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$toolId", "$$toolId"] },
                    { $gte: ["$createdAt", trendingWindowStart] },
                  ],
                },
              },
            },
            { $count: "count" },
          ],
        },
      },
      {
        $addFields: {
          recentComments: {
            $ifNull: [{ $arrayElemAt: ["$recentCommentStats.count", 0] }, 0],
          },
        },
      },
      { $match: { recentComments: { $gt: 0 } } },
      ...(commentsCursorMatch ? [{ $match: commentsCursorMatch }] : []),
      // eslint-disable-next-line perfectionist/sort-objects
      { $sort: { recentComments: -1, _id: -1 } },
      { $limit: limit },
    ],
    verified: [
      { $match: { ...baseFilter, owner: { $exists: true } } },
      ...(idCursorMatch ? [{ $match: idCursorMatch }] : []),
      { $sort: { _id: -1 } },
      { $limit: limit },
    ],
  } as const;

  return pipelines[tab] as unknown as Document[];
}

function buildSearchWords(query: string): RegExp[] {
  return query
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => new RegExp(word, "i"));
}

function getNextSearchCursor({
  last,
  limit,
  tab,
}: GetNextSearchCursorParams): NextCursor {
  if (!last || !last._id) return;
  if (limit <= 0) return;

  if (tab === "popular") {
    return {
      id: last._id.toString(),
      score: last.stats.upvotes - last.stats.downvotes,
      type: "score",
    };
  }

  if (tab === "trending") {
    return {
      comments: last.recentComments ?? 0,
      id: last._id.toString(),
      type: "comments",
    };
  }

  if (tab === "new" && last.releasedAt) {
    return {
      date: last.releasedAt.toISOString(),
      id: last._id.toString(),
      type: "date",
    };
  }

  return {
    id: last._id.toString(),
    type: "id",
  };
}

const search: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async (request, reply) => {
      const { cursor, limit = 20, query, tab } = request.query;

      const tools = fastify.getToolCollection();
      const toolComments = fastify.getToolCommentCollection();

      const trendingWindowStart = new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 7,
      );
      const words = buildSearchWords(query);
      const baseFilter = buildBaseSearchFilter(words);

      let decodedCursor;

      try {
        decodedCursor = decodeCursor(cursor, searchCursorPayloadSchema);
      } catch (error) {
        if (error instanceof InvalidCursorError) {
          return reply.code(400).send({
            message: "Invalid cursor",
            success: false,
          });
        }
        throw error;
      }

      const cursorMatches = buildCursorMatches(decodedCursor);
      const pipeline = buildSearchPipeline({
        baseFilter,
        commentsCollectionName: toolComments.collectionName,
        cursorMatches,
        limit,
        tab,
        trendingWindowStart,
      });

      const result = await tools
        .aggregate<ToolWithObjectIds>(pipeline)
        .toArray();

      const searchResults = result.map((tool) => {
        return serializeMongoTypes({
          _id: tool._id,
          image: tool.image,
          longDescription: tool.longDescription,
          name: tool.name,
          officialUrl: tool.officialUrl,
          releasedAt: tool.releasedAt,
          shortDescription: tool.shortDescription,
          slug: tool.slug,
          stats: tool.stats,
        });
      });

      const last = result.at(-1);
      let nextCursor: string | undefined;

      if (last && result.length === limit) {
        const cursorPayload = getNextSearchCursor({
          last,
          limit,
          tab,
        });

        if (cursorPayload) {
          nextCursor = encodeCursor(cursorPayload);
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
