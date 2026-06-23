import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { objectIdSchema } from "@workspace/shared/schemas/object-id";
import {
  getToolSlugsQueryStringSchema,
  getToolSlugsResponseSchemas,
} from "@workspace/shared/schemas/tools/get-tool-slugs";
import { ObjectId } from "mongodb";
import { z } from "zod";

import {
  decodeCursor,
  encodeCursor,
  InvalidCursorError,
} from "@/utils/cursor.js";
import { serializeMongoTypes } from "@/utils/serialize-mongo-types.js";

const toolSlugsCursorSchema = z.object({
  _id: objectIdSchema,
});

const getToolSlugs: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { cursor, limit = 1000 } = request.query;

      let decodedCursor: undefined | z.infer<typeof toolSlugsCursorSchema>;
      try {
        decodedCursor = decodeCursor(cursor, toolSlugsCursorSchema);
      } catch (error) {
        if (error instanceof InvalidCursorError) {
          return reply.code(400).send({
            message: "Invalid cursor",
            success: false,
          });
        }
        throw error;
      }

      const tools = fastify.db.tools;

      const toolSlugs = await tools
        .aggregate<{
          _id: ObjectId;
          slug: string;
        }>([
          {
            $match: {
              status: "published",
              ...(decodedCursor
                ? {
                    _id: {
                      $gt: ObjectId.createFromHexString(decodedCursor._id),
                    },
                  }
                : {}),
            },
          },
          { $sort: { _id: 1 } },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              slug: 1,
            },
          },
        ])
        .toArray();

      const lastTool = toolSlugs.at(-1);
      const nextCursor =
        toolSlugs.length === limit && lastTool
          ? encodeCursor({ _id: lastTool._id.toHexString() })
          : undefined;

      return reply.code(200).send({
        data: {
          nextCursor,
          tools: serializeMongoTypes(
            toolSlugs.map((tool) => ({
              slug: tool.slug,
            })),
          ),
        },
        message: "Tool slugs retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    schema: {
      querystring: getToolSlugsQueryStringSchema,
      response: getToolSlugsResponseSchemas,
      tags: ["Tools"],
    },
    url: "/slugs",
  });
};

export default getToolSlugs;
