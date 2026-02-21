import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { omitKeys } from "@workspace/shared/omit-keys";
import {
  searchQueryStringSchema,
  searchResponseSchemas,
} from "@workspace/shared/schemas/search";

import type { ToolWithObjectIds } from "@/schemas/tools/tool.js";

import {
  decodeCursor,
  encodeCursor,
  InvalidCursorError,
} from "@/utils/cursor-codec.js";
import { serializeMongoTypes } from "@/utils/serialize-mongo-types.js";

const search: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async (request, reply) => {
      const { cursor, limit = 20, query, tab } = request.query;

      const tools = fastify.getToolCollection();
      const toolComments = fastify.getToolCommentCollection();

      const trendingWindowStart = new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 7,
      );
      const words = fastify.buildSearchWords(query);
      const baseFilter = fastify.buildBaseSearchFilter(words);

      let decodedCursor;

      try {
        decodedCursor = decodeCursor(cursor);
      } catch (error) {
        if (error instanceof InvalidCursorError) {
          return reply.code(400).send({
            message: "Invalid cursor",
            success: false,
          });
        }
        throw error;
      }

      const cursorMatches = fastify.buildCursorMatches(decodedCursor);
      const pipeline = fastify.buildSearchPipeline({
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
        return serializeMongoTypes(omitKeys(tool, ["vectorEmbeddings"]));
      });

      const last = result.at(-1);
      let nextCursor: string | undefined;

      if (last && result.length === limit) {
        const cursorPayload = fastify.getNextSearchCursor({
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
