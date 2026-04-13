import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { Document } from "mongodb";

import { objectIdSchema } from "@workspace/shared/schemas/object-id";
import {
  type SearchQueryString,
  searchQueryStringSchema,
  searchResponseSchemas,
} from "@workspace/shared/schemas/search/search";
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

type BuildVectorSearchPipelineParams = {
  commentsCollectionName: string;
  cursorMatches: SearchCursorMatches;
  limit: number;
  minVectorScore: number;
  queryVector: number[];
  tab: SearchTab;
  trendingWindowStart: Date;
  vectorIndex: string;
};

type CursorPayload =
  | { comments: number; id: string; type: "comments" }
  | { date: string; id: string; type: "date" }
  | { id: string; score: number; type: "score" }
  | { id: string; type: "id" }
  | { id: string; type: "vectorScore"; vectorScore: number };

type GetNextSearchCursorParams = {
  last:
    | undefined
    | {
        _id?: ObjectId;
        recentComments?: number;
        releasedAt?: Date;
        score?: number;
        stats: { downvotes: number; upvotes: number };
        vectorScore?: number;
      };
  limit: number;
  tab: SearchTab;
};

type NextCursor =
  | undefined
  | { comments: number; id: string; type: "comments" }
  | { date: string; id: string; type: "date" }
  | { id: string; score: number; type: "score" }
  | { id: string; type: "id" }
  | { id: string; type: "vectorScore"; vectorScore: number };

type SearchCursorMatches = {
  commentsCursorMatch?: Record<string, unknown>;
  dateCursorMatch?: Record<string, unknown>;
  idCursorMatch?: Record<string, unknown>;
  scoreCursorMatch?: Record<string, unknown>;
  vectorScoreCursorMatch?: Record<string, unknown>;
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
  z.object({
    id: objectIdSchema,
    type: z.literal("vectorScore"),
    vectorScore: z.number(),
  }),
  z.object({ id: objectIdSchema, type: z.literal("id") }),
]);

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

  if (decodedCursor.type === "vectorScore") {
    return {
      vectorScoreCursorMatch: {
        $or: [
          { vectorScore: { $lt: decodedCursor.vectorScore } },
          {
            _id: { $lt: ObjectId.createFromHexString(decodedCursor.id) },
            vectorScore: decodedCursor.vectorScore,
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
  } as const;

  return pipelines[tab] as unknown as Document[];
}

function buildVectorSearchPipeline({
  commentsCollectionName,
  cursorMatches,
  limit,
  minVectorScore,
  queryVector,
  tab,
  trendingWindowStart,
  vectorIndex,
}: BuildVectorSearchPipelineParams): Document[] {
  const {
    commentsCursorMatch,
    dateCursorMatch,
    scoreCursorMatch,
    vectorScoreCursorMatch,
  } = cursorMatches;

  const candidateLimit = Math.max(limit * 10, 200);
  const vectorFilter = { status: "published" };

  const vectorStage: Document = {
    $vectorSearch: {
      filter: vectorFilter,
      index: vectorIndex,
      limit: candidateLimit,
      numCandidates: candidateLimit,
      path: "embeddings",
      queryVector,
    },
  };

  const pipelines = {
    all: [
      vectorStage,
      { $set: { vectorScore: { $meta: "vectorSearchScore" } } },
      { $match: { vectorScore: { $gte: minVectorScore } } },
      ...(vectorScoreCursorMatch ? [{ $match: vectorScoreCursorMatch }] : []),
      // eslint-disable-next-line perfectionist/sort-objects
      { $sort: { vectorScore: -1, _id: -1 } },
      { $limit: limit },
    ],
    new: [
      vectorStage,
      { $set: { vectorScore: { $meta: "vectorSearchScore" } } },
      { $match: { vectorScore: { $gte: minVectorScore } } },
      ...(dateCursorMatch ? [{ $match: dateCursorMatch }] : []),
      // eslint-disable-next-line perfectionist/sort-objects
      { $sort: { releasedAt: -1, _id: -1 } },
      { $limit: limit },
    ],
    popular: [
      vectorStage,
      { $set: { vectorScore: { $meta: "vectorSearchScore" } } },
      { $match: { vectorScore: { $gte: minVectorScore } } },
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
      vectorStage,
      { $set: { vectorScore: { $meta: "vectorSearchScore" } } },
      { $match: { vectorScore: { $gte: minVectorScore } } },
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
  } as const;

  return pipelines[tab] as unknown as Document[];
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

  if (tab === "all" && typeof last.score === "number") {
    return {
      id: last._id.toString(),
      score: last.score,
      type: "score",
    };
  }

  if (tab === "all" && typeof last.vectorScore === "number") {
    return {
      id: last._id.toString(),
      type: "vectorScore",
      vectorScore: last.vectorScore,
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
    // eslint-disable-next-line sonarjs/cognitive-complexity
    handler: async function (request, reply) {
      const isProduction = fastify.env.NODE_ENV === "production";

      const { cursor, limit = 20, query, tab } = request.query;

      const tools = fastify.getToolCollection();
      const toolComments = fastify.getToolCommentCollection();

      const trendingWindowStart = new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 7,
      );

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
      let result: Array<
        ToolWithObjectIds & { score?: number; vectorScore?: number }
      > = [];
      const queryVector = await fastify.generateEmbeddings([query]);
      const scoreCursor =
        decodedCursor && decodedCursor.type === "score"
          ? decodedCursor
          : undefined;

      if (isProduction) {
        const vectorIndex = "tool_embeddings";
        const vectorPipeline = buildVectorSearchPipeline({
          commentsCollectionName: toolComments.collectionName,
          cursorMatches,
          limit,
          minVectorScore: fastify.env.MIN_VECTOR_SCORE,
          queryVector,
          tab,
          trendingWindowStart,
          vectorIndex,
        });

        result = await tools
          .aggregate<
            ToolWithObjectIds & { score?: number; vectorScore?: number }
          >(vectorPipeline)
          .toArray();
      } else {
        const { default: cosineSimilarity } =
          await import("compute-cosine-similarity");

        const candidates = await tools
          .find({ embeddings: { $exists: true }, status: "published" })
          .project<ToolWithObjectIds>({
            _id: 1,
            embeddings: 1,
            longDescription: 1,
            name: 1,
            officialUrl: 1,
            releasedAt: 1,
            shortDescription: 1,
            slug: 1,
            stats: 1,
          })
          .toArray();

        const scored = candidates
          .flatMap((tool) => {
            if (!tool.embeddings || tool.embeddings.length === 0) return [];
            const score = cosineSimilarity(queryVector, tool.embeddings) ?? 0;
            if (score < fastify.env.MIN_VECTOR_SCORE) return [];
            return [{ ...tool, score }];
          })
          .toSorted((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a._id!.toString().localeCompare(b._id!.toString());
          });

        const candidateLimit = Math.max(limit * 10, 200);
        const candidatesForTab = scored.slice(0, candidateLimit);
        const candidateIds = candidatesForTab
          .map((item) => item._id)
          .filter((id): id is ObjectId => id instanceof ObjectId);

        if (tab === "all") {
          const paged = scoreCursor
            ? candidatesForTab.filter((item) => {
                if (item.score < scoreCursor.score) return true;
                if (item.score > scoreCursor.score) return false;
                return item._id!.toHexString() < scoreCursor.id;
              })
            : candidatesForTab;

          result = paged.slice(0, limit);
        } else if (candidateIds.length > 0) {
          const baseFilter = { status: "published" };

          const pipeline = buildSearchPipeline({
            baseFilter: { ...baseFilter, _id: { $in: candidateIds } },
            commentsCollectionName: toolComments.collectionName,
            cursorMatches,
            limit,
            tab,
            trendingWindowStart,
          });

          result = await tools.aggregate<ToolWithObjectIds>(pipeline).toArray();
        }
      }

      const searchResults = result.map((tool) => {
        return serializeMongoTypes({
          _id: tool._id,
          longDescription: tool.longDescription,
          name: tool.name,
          officialUrl: tool.officialUrl,
          releasedAt: tool.releasedAt,
          shortDescription: tool.shortDescription,
          slug: tool.slug,
          stats: tool.stats,
        });
      });

      let nextCursor: string | undefined;
      const last = result.at(-1);

      if (last && result.length === limit) {
        const cursorPayload = getNextSearchCursor({ last, limit, tab });

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
    url: "/",
  });
};

export default search;
