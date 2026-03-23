import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { Document } from "mongodb";

import { objectIdSchema } from "@workspace/shared/schemas/object-id";
import {
  getUsersLeaderboardQueryStringSchema,
  getUsersLeaderboardResponseSchemas,
} from "@workspace/shared/schemas/users/get-users-leaderboard";
import { ObjectId } from "mongodb";
import { z } from "zod";

import {
  decodeCursor,
  encodeCursor,
  InvalidCursorError,
} from "@/utils/cursor.js";
import { serializeMongoTypes } from "@/utils/serialize-mongo-types.js";

const leaderboardCursorSchema = z.object({
  rank: z.int().min(1),
  score: z.int().min(0),
  toolsAdded: z.int().min(0),
  toolsUpdated: z.int().min(0),
  userId: objectIdSchema,
});

type LeaderboardAggregate = {
  _id: ObjectId;
  score: number;
  toolsAdded: number;
  toolsUpdated: number;
  user: {
    _id: ObjectId;
    country?: string;
    createdAt: Date;
    gender?: "female" | "male" | "nonBinary" | "other" | "preferNotToSay";
    image?: string;
    name: string;
    username: string;
  };
};

type LeaderboardCursor = z.infer<typeof leaderboardCursorSchema>;

const getUsersLeaderboard: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { cursor, limit = 20 } = request.query;

      let decodedCursor: LeaderboardCursor | undefined;
      try {
        decodedCursor = decodeCursor(cursor, leaderboardCursorSchema);
      } catch (error) {
        if (error instanceof InvalidCursorError) {
          return reply.code(400).send({
            message: "Invalid cursor",
            success: false,
          });
        }
        throw error;
      }

      const tools = fastify.getToolCollection();

      const cursorMatch: Document[] = [];
      if (decodedCursor) {
        cursorMatch.push({
          $match: {
            $or: [
              { score: { $lt: decodedCursor.score } },
              {
                score: decodedCursor.score,
                toolsAdded: { $lt: decodedCursor.toolsAdded },
              },
              {
                score: decodedCursor.score,
                toolsAdded: decodedCursor.toolsAdded,
                toolsUpdated: { $lt: decodedCursor.toolsUpdated },
              },
              {
                _id: {
                  $gt: ObjectId.createFromHexString(decodedCursor.userId),
                },
                score: decodedCursor.score,
                toolsAdded: decodedCursor.toolsAdded,
                toolsUpdated: decodedCursor.toolsUpdated,
              },
            ],
          },
        });
      }

      const leaderboard = await tools
        .aggregate<LeaderboardAggregate>([
          {
            $match: {
              addedBy: { $type: "objectId" },
              status: "published",
            },
          },
          {
            $group: {
              _id: "$addedBy",
              toolsAdded: { $sum: 1 },
              toolsUpdated: { $sum: 0 },
            },
          },
          {
            $unionWith: {
              coll: fastify.env.MONGODB_COLL_TOOL,
              pipeline: [
                {
                  $match: {
                    status: "published",
                    updatedBy: { $type: "objectId" },
                  },
                },
                {
                  $group: {
                    _id: "$updatedBy",
                    toolsAdded: { $sum: 0 },
                    toolsUpdated: { $sum: 1 },
                  },
                },
              ],
            },
          },
          {
            $group: {
              _id: "$_id",
              toolsAdded: { $sum: "$toolsAdded" },
              toolsUpdated: { $sum: "$toolsUpdated" },
            },
          },
          {
            $addFields: {
              score: { $add: ["$toolsAdded", "$toolsUpdated"] },
            },
          },
          ...cursorMatch,
          {
            $sort: {
              score: -1,
              toolsAdded: -1,
              toolsUpdated: -1,
              // eslint-disable-next-line perfectionist/sort-objects
              _id: 1,
            },
          },
          { $limit: limit },
          {
            $lookup: {
              as: "user",
              foreignField: "_id",
              from: fastify.env.MONGODB_COLL_USER,
              localField: "_id",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    country: 1,
                    createdAt: 1,
                    gender: 1,
                    image: 1,
                    name: 1,
                    username: 1,
                  },
                },
              ],
            },
          },
          { $unwind: "$user" },
        ])
        .toArray();

      const totalsResult = await tools
        .aggregate<{
          _id: string;
          totalAdded: number;
          totalUpdated: number;
        }>([
          { $match: { status: "published" } },
          {
            $group: {
              _id: "totals",
              totalAdded: {
                $sum: {
                  $cond: [{ $eq: [{ $type: "$addedBy" }, "objectId"] }, 1, 0],
                },
              },
              totalUpdated: {
                $sum: {
                  $cond: [{ $eq: [{ $type: "$updatedBy" }, "objectId"] }, 1, 0],
                },
              },
            },
          },
        ])
        .toArray();

      const rankBase = decodedCursor?.rank ?? 0;

      const leaderboardResponse = leaderboard.map((entry, index) => ({
        country: entry.user.country,
        gender: entry.user.gender,
        image: entry.user.image,
        joinedAt: entry.user.createdAt,
        name: entry.user.name,
        rank: rankBase + index + 1,
        toolsAdded: entry.toolsAdded,
        toolsUpdated: entry.toolsUpdated,
        userId: entry.user._id,
        username: entry.user.username,
      }));

      let nextCursor: string | undefined;
      const lastEntry = leaderboard.at(-1);

      if (lastEntry && leaderboard.length === limit) {
        nextCursor = encodeCursor({
          rank: rankBase + leaderboard.length,
          score: lastEntry.score,
          toolsAdded: lastEntry.toolsAdded,
          toolsUpdated: lastEntry.toolsUpdated,
          userId: lastEntry._id.toHexString(),
        });
      }

      const totals = totalsResult[0] ?? {
        totalAdded: 0,
        totalUpdated: 0,
      };

      return reply.code(200).send({
        data: {
          leaderboard: serializeMongoTypes(leaderboardResponse),
          nextCursor,
          totals,
        },
        message: "Leaderboard retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    onRequest: [fastify.requireUser],
    schema: {
      querystring: getUsersLeaderboardQueryStringSchema,
      response: getUsersLeaderboardResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Users"],
    },
    url: "/leaderboard",
  });
};

export default getUsersLeaderboard;
