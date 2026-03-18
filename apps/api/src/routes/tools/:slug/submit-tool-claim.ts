import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  submitToolClaimBodySchema,
  submitToolClaimParamsSchema,
  submitToolClaimResponseSchemas,
} from "@workspace/shared/schemas/tools/submit-tool-claim";
import { ObjectId } from "mongodb";

const submitToolClaim: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      if (!request.user) throw new Error("User not authenticated");

      if (request.user.role === "member") {
        return reply.code(403).send({
          message: "Only active contributors and moderators can claim tools",
          success: false,
        });
      }

      const { slug } = request.params;
      const { discussionUrl, reason } = request.body;

      const tools = fastify.getToolCollection();
      const moderationCases = fastify.getModerationCaseCollection();

      const tool = await tools.findOne(
        { slug },
        { projection: { _id: 1, owner: 1, slug: 1 } },
      );

      if (!tool) {
        return reply.code(404).send({
          message: "Tool not found",
          success: false,
        });
      }

      const requesterUserId = ObjectId.createFromHexString(request.user.id);

      if (tool.owner?.toHexString() === requesterUserId.toHexString()) {
        return reply.code(409).send({
          message: "You already own this tool",
          success: false,
        });
      }

      const existingOpen = await moderationCases.findOne({
        status: { $in: ["open", "under_review"] },
        toolId: tool._id,
        type: "tool_claim",
      });

      if (existingOpen) {
        return reply.code(409).send({
          message: "This tool already has an active claim",
          success: false,
        });
      }

      const now = new Date();
      const insertResult = await moderationCases.insertOne({
        createdAt: now,
        createdBy: requesterUserId,
        discussionUrl,
        payload: { reason },
        status: "open",
        toolId: tool._id,
        toolSlug: tool.slug,
        type: "tool_claim",
        updatedAt: now,
      });

      if (!insertResult.acknowledged) {
        return reply.code(500).send({
          message: "Internal server error",
          success: false,
        });
      }

      return reply.code(201).send({
        data: { caseId: insertResult.insertedId.toHexString() },
        message: "Tool claim submitted successfully",
        success: true,
      });
    },
    method: "POST",
    onRequest: [fastify.requireStatus("active")],
    schema: {
      body: submitToolClaimBodySchema,
      params: submitToolClaimParamsSchema,
      response: submitToolClaimResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Tools"],
    },
    url: "/claims",
  });
};

export default submitToolClaim;
