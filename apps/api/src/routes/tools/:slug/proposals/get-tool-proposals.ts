import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  getToolProposalsParamsSchema,
  getToolProposalsResponseSchemas,
} from "@workspace/shared/schemas/tools/proposals/get-tool-proposals";
import { ObjectId } from "mongodb";

const getToolProposals: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { slug } = request.params;

      const tools = fastify.getToolCollection();
      const users = fastify.getUserCollection();
      const moderationCases = fastify.getModerationCaseCollection();

      const tool = await tools.findOne({ slug }, { projection: { _id: 1 } });

      if (!tool) {
        return reply.code(404).send({
          message: "Tool not found",
          success: false,
        });
      }

      const cases = await moderationCases
        .find({
          status: { $in: ["open", "under_review"] },
          toolId: tool._id,
          type: "tool_update_proposal",
        })
        .toArray();

      const updateCase = cases.find(
        (entry) => entry.type === "tool_update_proposal",
      );

      const requesterIds: ObjectId[] = [];

      if (updateCase) {
        requesterIds.push(updateCase.createdBy);
      }

      const requesters = await users
        .find(
          { _id: { $in: requesterIds } },
          { projection: { _id: 1, image: 1, name: 1, username: 1 } },
        )
        .toArray();

      const requesterMap = new Map(
        requesters.map((user) => [user._id.toHexString(), user] as const),
      );

      const updateRequester = updateCase
        ? requesterMap.get(updateCase.createdBy.toHexString())
        : undefined;

      const responseData = {
        updateCase:
          updateCase &&
          updateRequester &&
          (updateCase.status === "open" || updateCase.status === "under_review")
            ? {
                _id: updateCase._id.toHexString(),
                changes: updateCase.payload.changes,
                discussionUrl: updateCase.discussionUrl,
                requestedAt: updateCase.createdAt.toISOString(),
                requester: {
                  _id: updateRequester._id.toHexString(),
                  image: updateRequester.image,
                  name: updateRequester.name,
                  username: updateRequester.username,
                },
                status: updateCase.status,
                summary: updateCase.payload.summary,
                title: updateCase.payload.title,
              }
            : undefined,
      };

      return reply.code(200).send({
        data: responseData,
        message: "Tool moderation cases retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    onRequest: [fastify.requireUser],
    schema: {
      params: getToolProposalsParamsSchema,
      response: getToolProposalsResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Tools"],
    },
    url: "/",
  });
};

export default getToolProposals;
