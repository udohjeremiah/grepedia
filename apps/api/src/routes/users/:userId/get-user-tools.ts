import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  getUserToolsParamsSchema,
  getUserToolsResponseSchemas,
} from "@workspace/shared/schemas/users/get-user-tools";
import { ObjectId } from "mongodb";

import { serializeMongoTypes } from "@/utils/serialize-mongo-types.js";

const getUserTools: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { userId } = request.params;

      const users = fastify.db.users;
      const tools = fastify.db.tools;
      const toolReactions = fastify.db.toolReactions;

      const userObjectId = ObjectId.createFromHexString(userId);
      const user = await users.findOne({ _id: userObjectId });

      if (!user) {
        return reply.code(404).send({
          message: "User not found",
          success: false,
        });
      }

      const [toolsAdded, toolsReactions] = await Promise.all([
        tools.find({ addedBy: user._id }, { projection: { _id: 1 } }).toArray(),
        toolReactions
          .find({ userId: user._id }, { projection: { toolId: 1, value: 1 } })
          .toArray(),
      ]);

      const upvotedToolIds = toolsReactions
        .filter((r) => r.value === 1)
        .map((r) => r.toolId);

      const downvotedToolIds = toolsReactions
        .filter((r) => r.value === -1)
        .map((r) => r.toolId);

      const mergedToolIds: ObjectId[] = [
        ...toolsAdded.map((tool) => tool._id),
        ...upvotedToolIds,
        ...downvotedToolIds,
      ];

      const toolIdMap = new Map<string, ObjectId>(
        mergedToolIds.map((id) => [id.toHexString(), id]),
      );

      const allToolObjectIds = [...toolIdMap.values()];

      const allTool =
        allToolObjectIds.length > 0
          ? await tools
              .find(
                { _id: { $in: allToolObjectIds } },
                {
                  projection: {
                    addedAt: 1,
                    categories: 1,
                    name: 1,
                    officialUrl: 1,
                    shortDescription: 1,
                    slug: 1,
                    stats: 1,
                  },
                },
              )
              .toArray()
          : [];

      const addedSet = new Set(
        toolsAdded.map((tool) => tool._id.toHexString()),
      );
      const upvotedSet = new Set(upvotedToolIds.map((id) => id.toHexString()));
      const downvotedSet = new Set(
        downvotedToolIds.map((id) => id.toHexString()),
      );

      const toolsResponse = allTool.map((tool) => {
        const idHex = tool._id.toHexString();

        return serializeMongoTypes({
          _id: idHex,
          addedAt: tool.addedAt,
          categories: tool.categories,
          name: tool.name,
          officialUrl: tool.officialUrl,
          relations: {
            added: addedSet.has(idHex),
            downvoted: downvotedSet.has(idHex),
            upvoted: upvotedSet.has(idHex),
          },
          shortDescription: tool.shortDescription,
          slug: tool.slug,
          stats: tool.stats,
        });
      });

      return reply.code(200).send({
        data: {
          stats: {
            added: addedSet.size,
            downvoted: downvotedSet.size,
            upvoted: upvotedSet.size,
          },
          tools: toolsResponse,
        },
        message: "User tools retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    onRequest: [fastify.requireUserId()],
    schema: {
      params: getUserToolsParamsSchema,
      response: getUserToolsResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Users"],
    },
    url: "/tools",
  });
};

export default getUserTools;
