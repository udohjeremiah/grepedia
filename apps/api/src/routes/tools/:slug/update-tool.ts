import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  updateToolBodySchema,
  updateToolParamsSchema,
  updateToolResponseSchemas,
} from "@workspace/shared/schemas/tools/update-tool";
import { ObjectId } from "mongodb";

import { normalizeToolInput } from "@/utils/normalize-tool-input.js";

const updateTool: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      if (!request.user) throw new Error("User not authenticated");

      if (request.user.role === "member") {
        return reply.code(403).send({
          message: "Only contributors and moderators can update tools",
          success: false,
        });
      }

      const { slug } = request.params;
      const { changes, discussionUrl, summary, title } = request.body;
      const normalizedChanges = normalizeToolInput(changes);

      const tools = fastify.getToolCollection();
      const moderationCases = fastify.getModerationCaseCollection();

      const tool = await tools.findOne({ slug });

      if (!tool) {
        return reply.code(404).send({
          message: "Tool not found",
          success: false,
        });
      }

      const existingOpen = await moderationCases.findOne({
        status: { $in: ["open", "under_review"] },
        toolId: tool._id,
        type: "tool_update_proposal",
      });

      if (existingOpen) {
        return reply.code(409).send({
          message:
            "This tool already has a pending update proposal in moderation",
          success: false,
        });
      }

      const actorId = ObjectId.createFromHexString(request.user.id);
      const submittedAt = new Date();
      const insertResult = await moderationCases.insertOne({
        createdAt: submittedAt,
        createdBy: actorId,
        discussionUrl,
        payload: {
          changes: {
            categories: normalizedChanges.categories,
            externalUrls: normalizedChanges.externalUrls,
            image: normalizedChanges.image,
            longDescription: normalizedChanges.longDescription,
            name: normalizedChanges.name,
            officialUrl: normalizedChanges.officialUrl,
            releasedAt: normalizedChanges.releasedAt,
            shortDescription: normalizedChanges.shortDescription,
            tags: normalizedChanges.tags,
          },
          summary,
          title,
        },
        status: "open",
        toolId: tool._id,
        toolSlug: tool.slug,
        type: "tool_update_proposal",
        updatedAt: submittedAt,
      });

      if (!insertResult.acknowledged) {
        return reply.code(500).send({
          message: "Internal server error",
          success: false,
        });
      }

      return reply.code(202).send({
        data: {
          caseId: insertResult.insertedId.toHexString(),
          submittedAt: submittedAt.toISOString(),
        },
        message: "Tool update submitted for moderation review",
        success: true,
      });
    },
    method: "PATCH",
    onRequest: [fastify.requireStatus("active")],
    schema: {
      body: updateToolBodySchema,
      params: updateToolParamsSchema,
      response: updateToolResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Tools"],
    },
    url: "/",
  });
};

export default updateTool;
