import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { omitKeys } from "@workspace/shared/omit-keys";
import {
  getToolParamsSchema,
  getToolResponseSchemas,
} from "@workspace/shared/schemas/tools/get-tool";
import { ObjectId } from "mongodb";

import { serializeMongoTypes } from "@/utils/serialize-mongo-types.js";

const getTool: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      if (!request.user) throw new Error("User not authenticated");

      const { slug } = request.params;

      const tools = fastify.getToolCollection();
      const toolReactions = fastify.getToolReactionCollection();
      const toolComments = fastify.getToolCommentCollection();
      const userBookmarks = fastify.getUserBookmarkCollection();
      const users = fastify.getUserCollection();

      const tool = await tools.findOne({ slug });

      if (!tool) {
        return reply.code(404).send({
          message: "Tool not found",
          success: false,
        });
      }

      const userIds = [
        ...new Set(
          [tool.owner, tool.addedBy, tool.updatedBy]
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

      const currentUserId = ObjectId.createFromHexString(request.user.id);

      const [reaction, comment, bookmark] = await Promise.all([
        toolReactions.findOne(
          { toolId: tool._id, userId: currentUserId },
          { projection: { value: 1 } },
        ),
        toolComments.findOne(
          { toolId: tool._id, userId: currentUserId },
          { projection: { _id: 1 } },
        ),
        userBookmarks.findOne(
          { toolId: tool._id, userId: currentUserId },
          { projection: { _id: 1 } },
        ),
      ]);

      const toolResponse = serializeMongoTypes({
        ...omitKeys(tool, ["vectorEmbeddings"]),
        addedBy:
          userById.get(tool.addedBy.toHexString()) ??
          tool.addedBy.toHexString(),
        owner: tool.owner
          ? (userById.get(tool.owner.toHexString()) ?? tool.owner.toHexString())
          : undefined,
        relations: {
          bookmarked: Boolean(bookmark),
          commented: Boolean(comment),
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
    onRequest: [fastify.requireStatus("active")],
    schema: {
      params: getToolParamsSchema,
      response: getToolResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Tools"],
    },
    url: "/",
  });
};

export default getTool;
