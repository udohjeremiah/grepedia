import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  type Tool,
  type ToolWithObjectIds,
  toolSchema,
} from "@/schemas/tool-schema.js";
import { omitKeys } from "@workspace/shared/omit-keys";
import { convertObjectIdsToStrings } from "@/utils/convert-objectids-to-string.js";
import type { Document } from "mongodb";

const search: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    method: "GET",
    url: "/search",
    schema: {
      querystring: z.object({
        q: z.string().min(2).max(8192),
        page: z.number().int().min(1).optional(),
        limit: z.number().int().min(1).max(100).optional(),
      }),
      response: {
        default: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.unknown().optional(),
        }),
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.object({
            all: z.array(toolSchema),
            topVotes: z.array(toolSchema),
            mostComments: z.array(toolSchema),
            verifiedOwners: z.array(toolSchema),
            recentlyReleased: z.array(toolSchema),
            recentlyAdded: z.array(toolSchema),
            recentlyUpdated: z.array(toolSchema),
          }),
        }),
      },
    },
    handler: async (request, reply) => {
      const { q: query, page = 1, limit = 10 } = request.query;
      const skip = (page - 1) * limit;

      const tools = fastify.getToolCollection();

      // Split query into words and convert to regex for MongoDB
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

      // Define tabs as a typed array
      const tabs = [
        "all",
        "topVotes",
        "mostComments",
        "verifiedOwners",
        "recentlyReleased",
        "recentlyAdded",
        "recentlyUpdated",
      ] as const;
      type Tab = (typeof tabs)[number];

      // Build pipelines keyed by tab
      const pipelines: Record<Tab, Document[]> = {
        all: [{ $match: baseFilter }, { $skip: skip }, { $limit: limit }],
        topVotes: [
          { $match: baseFilter },
          {
            $addFields: {
              score: { $subtract: ["$stats.upvotes", "$stats.downvotes"] },
            },
          },
          { $sort: { score: -1 } },
          { $skip: skip },
          { $limit: limit },
        ],
        mostComments: [
          { $match: baseFilter },
          { $sort: { "stats.comments": -1 } },
          { $skip: skip },
          { $limit: limit },
        ],
        verifiedOwners: [
          { $match: { ...baseFilter, owner: { $ne: null } } },
          { $skip: skip },
          { $limit: limit },
        ],
        recentlyReleased: [
          { $match: baseFilter },
          { $sort: { released_at: -1 } },
          { $skip: skip },
          { $limit: limit },
        ],
        recentlyAdded: [
          { $match: baseFilter },
          { $sort: { added_at: -1 } },
          { $skip: skip },
          { $limit: limit },
        ],
        recentlyUpdated: [
          { $match: baseFilter },
          { $sort: { updated_at: -1 } },
          { $skip: skip },
          { $limit: limit },
        ],
      };

      // Execute all pipelines in parallel
      const results: Record<Tab, Tool[]> = {} as Record<Tab, Tool[]>;

      await Promise.all(
        tabs.map(async (tab) => {
          const array = await tools
            .aggregate<ToolWithObjectIds>(pipelines[tab])
            .toArray();

          results[tab] = array.map((tool) => {
            const converted = convertObjectIdsToStrings(
              omitKeys(tool, ["vectorEmbeddings"]),
            );
            return { ...converted, _id: converted._id! };
          });
        }),
      );

      return reply.code(200).send({
        success: true,
        message: "Search results retrieved successfully",
        data: results,
      });
    },
  });
};

export default search;
