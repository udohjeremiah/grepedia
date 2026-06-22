import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  getToolParamsSchema,
  getToolResponseSchemas,
} from "@workspace/shared/schemas/tools/get-tool";
import { omitKeys } from "@workspace/shared/utils/omit-keys";
import { ObjectId } from "mongodb";

import { serializeMongoTypes } from "@/utils/serialize-mongo-types.js";

const getTool: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { slug } = request.params;

      const tools = fastify.db.tools;
      const toolReactions = fastify.db.toolReactions;
      const userBookmarks = fastify.db.userBookmarks;
      const users = fastify.db.users;

      const tool = await tools.findOne({ slug });

      if (!tool) {
        return reply.code(404).send({
          message: "Tool not found",
          success: false,
        });
      }

      const userIds = [
        ...new Set(
          [tool.addedBy, tool.updatedBy]
            .filter((value): value is ObjectId => value instanceof ObjectId)
            .map((value) => value.toHexString()),
        ),
      ].map((id) => ObjectId.createFromHexString(id));

      const toolUsers =
        userIds.length > 0
          ? await users
              .find(
                { _id: { $in: userIds } },
                { projection: { _id: 1, username: 1 } },
              )
              .toArray()
          : [];

      const userById = new Map(
        toolUsers.map((user) => [user._id.toHexString(), user.username]),
      );

      const currentUserId = request.user?.id
        ? ObjectId.createFromHexString(request.user.id)
        : undefined;

      const [reaction, bookmark] = currentUserId
        ? await Promise.all([
            toolReactions.findOne(
              { toolId: tool._id, userId: currentUserId },
              { projection: { value: 1 } },
            ),
            userBookmarks.findOne(
              { toolId: tool._id, userId: currentUserId },
              { projection: { _id: 1 } },
            ),
          ])
        : // eslint-disable-next-line unicorn/no-null
          [null, null, null];

      const toolResponse = serializeMongoTypes({
        ...omitKeys(tool, ["embeddings"]),
        addedBy:
          userById.get(tool.addedBy.toHexString()) ??
          tool.addedBy.toHexString(),
        relations: {
          bookmarked: Boolean(bookmark),
          downvoted: reaction?.value === -1,
          upvoted: reaction?.value === 1,
        },
        updatedBy: tool.updatedBy
          ? (userById.get(tool.updatedBy.toHexString()) ??
            tool.updatedBy.toHexString())
          : undefined,
      });

      return reply.code(200).send({
        data: { tool: toolResponse },
        message: "Tool retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    onRequest: [fastify.setUserIfPresent],
    schema: {
      params: getToolParamsSchema,
      response: getToolResponseSchemas,
      tags: ["Tools"],
    },
    url: "/",
  });
};

export default getTool;
