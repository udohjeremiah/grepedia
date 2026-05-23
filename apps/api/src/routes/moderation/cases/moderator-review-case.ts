import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  moderatorReviewCaseBodySchema,
  moderatorReviewCaseResponseSchemas,
} from "@workspace/shared/schemas/moderation/moderator-review-case";
import { ObjectId } from "mongodb";

const moderatorReviewCase: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    // eslint-disable-next-line sonarjs/cognitive-complexity
    handler: async function (request, reply) {
      if (!request.user) throw new Error("User not authenticated");

      const { caseId, decision, decisionSummary, decisionTitle } = request.body;

      const moderationCases = fastify.db.moderationCases;
      const tools = fastify.db.tools;
      const toolRevisions = fastify.db.toolRevisions;

      const moderationCase = await moderationCases.findOne({
        _id: ObjectId.createFromHexString(caseId),
      });

      if (!moderationCase) {
        return reply.code(404).send({
          message: "Moderation case not found",
          success: false,
        });
      }

      if (["approved", "rejected"].includes(moderationCase.status)) {
        return reply.code(409).send({
          message: "This moderation case has already been resolved",
          success: false,
        });
      }

      const now = new Date();

      if (decision === "under_review") {
        await moderationCases.updateOne(
          { _id: moderationCase._id },
          { $set: { status: "under_review", updatedAt: now } },
        );

        return reply.code(200).send({
          data: { caseId, status: "under_review" },
          message: "Moderation case marked as under review",
          success: true,
        });
      }

      if (decision === "approve") {
        if (!decisionTitle) {
          return reply.code(400).send({
            message: "Decision title is required when approving a case",
            success: false,
          });
        }

        if (!decisionSummary) {
          return reply.code(400).send({
            message: "Decision summary is required when approving a case",
            success: false,
          });
        }

        if (moderationCase.type === "tool_update_proposal") {
          const changes = moderationCase.payload.changes;
          const releasedAt = changes.releasedAt
            ? new Date(changes.releasedAt)
            : undefined;

          let embeddings: number[];
          try {
            const contentToEmbed = [
              changes.name,
              changes.shortDescription,
              changes.longDescription,
              `Categories: ${changes.categories.join(", ")}`,
              `Tags: ${changes.tags.join(", ")}`,
              `Released at: ${changes.releasedAt ?? "N/A"}`,
            ];
            embeddings = await fastify.generateEmbeddings(contentToEmbed);
          } catch (error) {
            fastify.log.error(error, "Embedding error");
            return reply.code(500).send({
              message: "Failed to generate tool embeddings",
              success: false,
            });
          }

          const updateResult = await tools.updateOne(
            { _id: moderationCase.toolId },
            {
              $set: {
                ...changes,
                embeddings,
                releasedAt,
                updatedAt: now,
                updatedBy: moderationCase.createdBy,
              },
            },
          );

          if (!updateResult.acknowledged || updateResult.matchedCount !== 1) {
            return reply.code(500).send({
              message: "Internal server error",
              success: false,
            });
          }

          const latestRevision = await toolRevisions.findOne(
            { toolId: moderationCase.toolId },
            {
              projection: { revisionNumber: 1 },
              sort: { _id: -1, revisionNumber: -1 },
            },
          );

          const revisionInsertResult = await toolRevisions.insertOne({
            createdAt: now,
            createdBy: moderationCase.createdBy,
            isRevert: false,
            linkedDiscussionUrl: moderationCase.discussionUrl,
            revisionNumber: (latestRevision?.revisionNumber ?? 0) + 1,
            snapshot: {
              ...changes,
              releasedAt,
            },
            summary: moderationCase.payload.summary,
            title: moderationCase.payload.title,
            toolId: moderationCase.toolId,
            toolSlug: moderationCase.toolSlug,
          });

          if (!revisionInsertResult.acknowledged) {
            return reply.code(500).send({
              message: "Internal server error",
              success: false,
            });
          }

          const tool = await tools.findOne({ slug: moderationCase.toolSlug });

          if (tool) {
            fastify.preWarmOg(tool.slug, {
              categories: changes.categories,
              comments: tool.stats.comments,
              description: changes.shortDescription,
              name: changes.name,
              officialUrl: changes.officialUrl,
              upvotes: tool.stats.upvotes,
            });
          }
        }
      }

      await moderationCases.deleteOne({ _id: moderationCase._id });

      const updatedStatus = decision === "approve" ? "approved" : "rejected";

      return reply.code(200).send({
        data: { caseId, status: updatedStatus },
        message:
          updatedStatus === "approved"
            ? "Moderation case approved"
            : "Moderation case rejected",
        success: true,
      });
    },
    method: "POST",
    onRequest: [fastify.requireModerator],
    schema: {
      body: moderatorReviewCaseBodySchema,
      response: moderatorReviewCaseResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Moderation"],
    },
    url: "/review",
  });
};

export default moderatorReviewCase;
