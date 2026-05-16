import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  revertToolRevisionBodySchema,
  revertToolRevisionParamsSchema,
  revertToolRevisionResponseSchemas,
} from "@workspace/shared/schemas/tools/revisions/revert-tool-revision";
import { toolRevisionSnapshotSchema } from "@workspace/shared/schemas/tools/revisions/tool-revision";
import { ObjectId } from "mongodb";

export const TOOL_SNAPSHOT_FIELDS = Object.keys(
  toolRevisionSnapshotSchema.shape,
) as (keyof typeof toolRevisionSnapshotSchema.shape)[];

const revertToolRevision: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      if (!request.user) throw new Error("User not authenticated");

      if (request.user.role !== "moderator") {
        return reply.code(403).send({
          message: "Only moderators can revert revisions",
          success: false,
        });
      }

      const { slug } = request.params;
      const { revisionId, summary, title } = request.body;

      const tools = fastify.db.tools;
      const toolRevisions = fastify.db.toolRevisions;

      const tool = await tools.findOne({ slug });

      if (!tool) {
        return reply.code(404).send({
          message: "Tool not found",
          success: false,
        });
      }

      const targetRevision = await toolRevisions.findOne({
        _id: ObjectId.createFromHexString(revisionId),
        toolId: tool._id,
      });

      if (!targetRevision) {
        return reply.code(404).send({
          message: "Revision not found",
          success: false,
        });
      }

      const actorId = ObjectId.createFromHexString(request.user.id);
      const updatedAt = new Date();

      const updateFields: Record<string, unknown> = {};
      const unsetFields: Record<string, 1 | ""> = {};

      for (const field of TOOL_SNAPSHOT_FIELDS) {
        const value = targetRevision.snapshot[field];
        if (value === undefined) {
          unsetFields[field] = "";
        } else {
          updateFields[field] = value;
        }
      }

      const updateResult = await tools.updateOne(
        { _id: tool._id },
        {
          $set: { ...updateFields, updatedAt, updatedBy: actorId },
          $unset: unsetFields,
        },
      );

      if (!updateResult.acknowledged || updateResult.matchedCount !== 1) {
        return reply.code(500).send({
          message: "Internal server error",
          success: false,
        });
      }

      const latestRevision = await toolRevisions.findOne(
        { toolId: tool._id },
        {
          projection: { revisionNumber: 1 },
          sort: { _id: -1, revisionNumber: -1 },
        },
      );

      const revisionNumber = (latestRevision?.revisionNumber ?? 0) + 1;

      const revisionInsertResult = await toolRevisions.insertOne({
        createdAt: updatedAt,
        createdBy: actorId,
        isRevert: true,
        revertedFromRevisionId: targetRevision._id,
        revisionNumber,
        snapshot: targetRevision.snapshot,
        summary,
        title,
        toolId: tool._id,
        toolSlug: tool.slug,
      });

      if (!revisionInsertResult.acknowledged) {
        return reply.code(500).send({
          message: "Internal server error",
          success: false,
        });
      }

      return reply.code(200).send({
        data: {
          revertedToRevisionId: targetRevision._id.toHexString(),
          revisionNumber,
          updatedAt: updatedAt.toISOString(),
        },
        message: "Tool reverted successfully",
        success: true,
      });
    },
    method: "POST",
    onRequest: [fastify.requireStatus("active")],
    schema: {
      body: revertToolRevisionBodySchema,
      params: revertToolRevisionParamsSchema,
      response: revertToolRevisionResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Tools"],
    },
    url: "/",
  });
};

export default revertToolRevision;
