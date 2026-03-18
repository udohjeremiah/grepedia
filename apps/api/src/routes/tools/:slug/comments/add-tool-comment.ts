import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  addToolCommentBodySchema,
  addToolCommentParamsSchema,
  addToolCommentResponseSchemas,
} from "@workspace/shared/schemas/tools/comments/add-tool-comment";
import { ObjectId } from "mongodb";

import { serializeMongoTypes } from "@/utils/serialize-mongo-types.js";

const addToolComment: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      if (!request.user) throw new Error("User not authenticated");

      const { slug } = request.params;
      const { content, parentCommentId } = request.body;

      const tools = fastify.getToolCollection();
      const comments = fastify.getToolCommentCollection();
      const users = fastify.getUserCollection();

      const tool = await tools.findOne({ slug }, { projection: { _id: 1 } });

      if (!tool) {
        return reply.code(404).send({
          message: "Tool not found",
          success: false,
        });
      }

      const userId = ObjectId.createFromHexString(request.user.id);
      const user = await users.findOne(
        { _id: userId },
        { projection: { _id: 1, image: 1, name: 1, username: 1 } },
      );

      if (!user) {
        return reply.code(404).send({
          message: "User not found",
          success: false,
        });
      }

      let parentId: ObjectId | undefined;
      if (parentCommentId) {
        parentId = ObjectId.createFromHexString(parentCommentId);
        const parent = await comments.findOne({
          _id: parentId,
          toolId: tool._id,
        });

        if (!parent) {
          return reply.code(404).send({
            message: "Parent comment not found",
            success: false,
          });
        }
      }

      const now = new Date();
      const insertResult = await comments.insertOne({
        content,
        createdAt: now,
        parentCommentId: parentId,
        replyCount: 0,
        stats: { downvotes: 0, upvotes: 0 },
        toolId: tool._id,
        updatedAt: now,
        userId,
      });

      if (!insertResult.acknowledged) {
        return reply.code(500).send({
          message: "Internal server error",
          success: false,
        });
      }

      if (parentId) {
        const updateParentResult = await comments.updateOne(
          { _id: parentId },
          { $inc: { replyCount: 1 } },
        );

        if (!updateParentResult.acknowledged) {
          return reply.code(500).send({
            message: "Internal server error",
            success: false,
          });
        }
      }

      const updateToolResult = await tools.updateOne(
        { _id: tool._id },
        { $inc: { "stats.comments": 1 } },
      );

      if (!updateToolResult.acknowledged) {
        return reply.code(500).send({
          message: "Internal server error",
          success: false,
        });
      }

      fastify.evaluateUserTrust(userId).catch((error: unknown) => {
        fastify.log.error(error);
      });

      return reply.code(201).send({
        data: {
          comment: serializeMongoTypes({
            _id: insertResult.insertedId,
            content,
            createdAt: now,
            parentCommentId: parentId,
            replyCount: 0,
            stats: { downvotes: 0, upvotes: 0 },
            updatedAt: now,
            user,
          }),
        },
        message: "Comment added successfully",
        success: true,
      });
    },
    method: "POST",
    onRequest: [fastify.requireStatus("active")],
    schema: {
      body: addToolCommentBodySchema,
      params: addToolCommentParamsSchema,
      response: addToolCommentResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Tools"],
    },
    url: "/",
  });
};

export default addToolComment;
