import type { SearchQueryString } from "@workspace/shared/schemas/search";
import type { Document } from "mongodb";

import fp from "fastify-plugin";
import { Collection, ObjectId } from "mongodb";

import type { CursorPayload } from "@/utils/cursor-codec.js";

declare module "fastify" {
  interface FastifyInstance {
    buildBaseSearchFilter(words: RegExp[]): Record<string, unknown>;
    buildCursorMatches(decodedCursor: CursorPayload): SearchCursorMatches;
    buildSearchPipeline(params: BuildSearchPipelineParams): Document[];
    buildSearchWords(query: string): RegExp[];
    getNextSearchCursor(params: GetNextSearchCursorParams): NextCursor;
  }
}

type BuildSearchPipelineParams = {
  baseFilter: Record<string, unknown>;
  commentsCollectionName: Collection["collectionName"];
  cursorMatches: SearchCursorMatches;
  limit: number;
  tab: SearchTab;
  trendingWindowStart: Date;
};

type GetNextSearchCursorParams = {
  last:
    | undefined
    | {
        _id?: ObjectId;
        recentComments?: number;
        releasedAt?: string;
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

export default fp(
  async (fastify) => {
    fastify.decorate("buildSearchWords", (query: string) => {
      return query
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => new RegExp(word, "i"));
    });

    fastify.decorate("buildBaseSearchFilter", (words: RegExp[]) => {
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
    });

    fastify.decorate("buildCursorMatches", (decodedCursor: CursorPayload) => {
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
    });

    fastify.decorate(
      "buildSearchPipeline",
      ({
        baseFilter,
        commentsCollectionName,
        cursorMatches,
        limit,
        tab,
        trendingWindowStart,
      }: BuildSearchPipelineParams) => {
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
                  $ifNull: [
                    { $arrayElemAt: ["$recentCommentStats.count", 0] },
                    0,
                  ],
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
      },
    );

    fastify.decorate(
      "getNextSearchCursor",
      ({ last, limit, tab }: GetNextSearchCursorParams) => {
        if (!last || !last._id) return;
        if (limit <= 0) return;

        if (tab === "popular") {
          return {
            id: last._id.toString(),
            score: last.stats.upvotes - last.stats.downvotes,
            type: "score" as const,
          };
        }

        if (tab === "trending") {
          return {
            comments: last.recentComments ?? 0,
            id: last._id.toString(),
            type: "comments" as const,
          };
        }

        if (tab === "new" && last.releasedAt) {
          return {
            date: last.releasedAt,
            id: last._id.toString(),
            type: "date" as const,
          };
        }

        return {
          id: last._id.toString(),
          type: "id" as const,
        };
      },
    );
  },
  { name: "search" },
);
