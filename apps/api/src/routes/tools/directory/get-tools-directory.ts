import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { objectIdSchema } from "@workspace/shared/schemas/object-id";
import {
  getToolsDirectoryQueryStringSchema,
  getToolsDirectoryResponseSchemas,
} from "@workspace/shared/schemas/tools/directory/get-tools-directory";
import { ObjectId } from "mongodb";
import { z } from "zod";

import {
  decodeCursor,
  encodeCursor,
  InvalidCursorError,
} from "@/utils/cursor.js";
import { serializeMongoTypes } from "@/utils/serialize-mongo-types.js";

const toolsDirectoryCursorSchema = z.object({
  _id: objectIdSchema,
  category: z.string().min(1).max(64),
  name: z.string(),
});

// eslint-disable-next-line perfectionist/sort-objects
const toolsDirectorySort = { name: 1, _id: 1 } as const;

type ToolsDirectoryCursor = z.infer<typeof toolsDirectoryCursorSchema>;

const getToolsDirectory: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { category, cursor, limit = 12 } = request.query;

      let decodedCursor: ToolsDirectoryCursor | undefined;
      try {
        decodedCursor = decodeCursor(cursor, toolsDirectoryCursorSchema);
      } catch (error) {
        if (error instanceof InvalidCursorError) {
          return reply.code(400).send({
            message: "Invalid cursor",
            success: false,
          });
        }
        throw error;
      }

      if (decodedCursor && decodedCursor.category !== category) {
        return reply.code(400).send({
          message: "Invalid cursor",
          success: false,
        });
      }

      const tools = fastify.getToolCollection();

      const toolsDirectory = await tools
        .aggregate<{
          _id: ObjectId;
          categories: string[];
          name: string;
          officialUrl: string;
          shortDescription: string;
          slug: string;
          stats: {
            comments: number;
            downvotes: number;
            upvotes: number;
          };
        }>([
          {
            $match: {
              categories: category,
              status: "published",
            },
          },
          ...(decodedCursor
            ? [
                {
                  $match: {
                    $or: [
                      { name: { $gt: decodedCursor.name } },
                      {
                        _id: {
                          $gt: ObjectId.createFromHexString(decodedCursor._id),
                        },
                        name: decodedCursor.name,
                      },
                    ],
                  },
                },
              ]
            : []),
          { $sort: toolsDirectorySort },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              categories: 1,
              name: 1,
              officialUrl: 1,
              shortDescription: 1,
              slug: 1,
              stats: 1,
            },
          },
        ])
        .toArray();

      let nextCursor: string | undefined;
      const lastTool = toolsDirectory.at(-1);

      if (lastTool && toolsDirectory.length === limit) {
        nextCursor = encodeCursor({
          _id: lastTool._id.toHexString(),
          category,
          name: lastTool.name,
        });
      }

      return reply.code(200).send({
        data: {
          category,
          nextCursor,
          tools: serializeMongoTypes(toolsDirectory),
        },
        message: "Tools directory retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    schema: {
      querystring: getToolsDirectoryQueryStringSchema,
      response: getToolsDirectoryResponseSchemas,
      tags: ["Tools"],
    },
    url: "/",
  });
};

export default getToolsDirectory;
