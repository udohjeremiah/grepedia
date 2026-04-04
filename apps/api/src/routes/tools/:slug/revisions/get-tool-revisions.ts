import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { objectIdSchema } from "@workspace/shared/schemas/object-id";
import {
  getToolRevisionsParamsSchema,
  getToolRevisionsQueryStringSchema,
  getToolRevisionsResponseSchemas,
} from "@workspace/shared/schemas/tools/revisions/get-tool-revisions";
import { ObjectId } from "mongodb";
import { z } from "zod";

import {
  decodeCursor,
  encodeCursor,
  InvalidCursorError,
} from "@/utils/cursor.js";
import { serializeMongoTypes } from "@/utils/serialize-mongo-types.js";

const toolRevisionsCursorSchema = z.object({
  _id: objectIdSchema,
  revisionNumber: z.int().min(1),
});

type ToolRevisionsCursor = z.infer<typeof toolRevisionsCursorSchema>;

const getToolRevisions: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { slug } = request.params;
      const { cursor, limit = 20 } = request.query;

      let decodedCursor: ToolRevisionsCursor | undefined;
      try {
        decodedCursor = decodeCursor(cursor, toolRevisionsCursorSchema);
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
      const toolRevisions = fastify.getToolRevisionCollection();

      const tool = await tools.findOne({ slug }, { projection: { _id: 1 } });

      if (!tool) {
        return reply.code(404).send({
          message: "Tool not found",
          success: false,
        });
      }

      const revisions = await toolRevisions
        .aggregate<{
          _id: ObjectId;
          createdAt: Date;
          createdBy: string;
          isRevert: boolean;
          linkedDiscussionId?: ObjectId;
          linkedDiscussionUrl?: string;
          revertedFromRevisionId?: ObjectId;
          revisionNumber: number;
          snapshot: {
            categories: string[];
            externalUrls?: { platform: string; url: string }[];
            longDescription: string;
            name: string;
            officialUrl: string;
            releasedAt?: Date;
            shortDescription: string;
            tags: string[];
          };
          summary: string;
          title: string;
        }>([
          {
            $match: {
              toolId: tool._id,
            },
          },
          ...(decodedCursor
            ? [
                {
                  $match: {
                    $or: [
                      { revisionNumber: { $lt: decodedCursor.revisionNumber } },
                      {
                        _id: {
                          $lt: ObjectId.createFromHexString(decodedCursor._id),
                        },
                        revisionNumber: decodedCursor.revisionNumber,
                      },
                    ],
                  },
                },
              ]
            : []),
          {
            $sort: {
              _id: -1,
              revisionNumber: -1,
            },
          },
          { $limit: limit },
          {
            $lookup: {
              as: "actor",
              foreignField: "_id",
              from: fastify.env.MONGODB_COLL_USER,
              localField: "createdBy",
              pipeline: [{ $project: { _id: 0, username: 1 } }],
            },
          },
          {
            $project: {
              _id: 1,
              createdAt: 1,
              createdBy: {
                $ifNull: [{ $first: "$actor.username" }, "$createdBy"],
              },
              isRevert: 1,
              linkedDiscussionId: 1,
              linkedDiscussionUrl: 1,
              revertedFromRevisionId: 1,
              revisionNumber: 1,
              snapshot: {
                categories: 1,
                externalUrls: 1,
                longDescription: 1,
                name: 1,
                officialUrl: 1,
                releasedAt: 1,
                shortDescription: 1,
                tags: 1,
              },
              summary: 1,
              title: 1,
            },
          },
        ])
        .toArray();

      let nextCursor: string | undefined;
      const lastRevision = revisions.at(-1);

      if (lastRevision && revisions.length === limit) {
        nextCursor = encodeCursor({
          _id: lastRevision._id.toHexString(),
          revisionNumber: lastRevision.revisionNumber,
        });
      }

      return reply.code(200).send({
        data: {
          nextCursor,
          revisions: serializeMongoTypes(revisions),
        },
        message: "Tool revisions retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    onRequest: [fastify.requireUser],
    schema: {
      params: getToolRevisionsParamsSchema,
      querystring: getToolRevisionsQueryStringSchema,
      response: getToolRevisionsResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Tools"],
    },
    url: "/",
  });
};

export default getToolRevisions;
