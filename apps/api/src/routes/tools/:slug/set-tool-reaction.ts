import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  setToolReactionBodySchema,
  setToolReactionParamsSchema,
  setToolReactionResponseSchemas,
} from "@workspace/shared/schemas/tools/reactions/set-tool-reaction";
import { ObjectId } from "mongodb";

type ReactionAction = "delete" | "insert" | "update";
type ReactionValue = -1 | 1;

function getToolStatsDelta(action: ReactionAction, value: ReactionValue) {
  if (action === "insert") {
    return value === 1 ? { "stats.upvotes": 1 } : { "stats.downvotes": 1 };
  }

  if (action === "delete") {
    return value === 1 ? { "stats.upvotes": -1 } : { "stats.downvotes": -1 };
  }

  return value === 1
    ? { "stats.downvotes": -1, "stats.upvotes": 1 }
    : { "stats.downvotes": 1, "stats.upvotes": -1 };
}

function resolveReactionAction(
  existingValue: ReactionValue | undefined,
  nextValue: ReactionValue,
): { action: ReactionAction; reaction: ReactionValue | undefined } {
  if (existingValue === undefined) {
    return { action: "insert", reaction: nextValue };
  }

  if (existingValue === nextValue) {
    return { action: "delete", reaction: undefined };
  }

  return { action: "update", reaction: nextValue };
}

const setToolReaction: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      if (!request.user) throw new Error("User not authenticated");

      const { slug } = request.params;
      const { value } = request.body;

      const tools = fastify.db.tools;
      const toolReactions = fastify.db.toolReactions;

      const tool = await tools.findOne({ slug }, { projection: { _id: 1 } });

      if (!tool) {
        return reply.code(404).send({
          message: "Tool not found",
          success: false,
        });
      }

      const userId = ObjectId.createFromHexString(request.user.id);
      const existingReaction = await toolReactions.findOne({
        toolId: tool._id,
        userId,
      });

      const { action, reaction } = resolveReactionAction(
        existingReaction?.value,
        value,
      );

      if (action === "insert") {
        const now = new Date();

        const insertResult = await toolReactions.insertOne({
          createdAt: now,
          toolId: tool._id,
          updatedAt: now,
          userId,
          value,
        });

        if (!insertResult.acknowledged) {
          return reply.code(500).send({
            message: "Internal server error",
            success: false,
          });
        }
      }

      if (action === "delete" && existingReaction) {
        const deleteResult = await toolReactions.deleteOne({
          _id: existingReaction._id,
        });

        if (!deleteResult.acknowledged) {
          return reply.code(500).send({
            message: "Internal server error",
            success: false,
          });
        }
      }

      if (action === "update" && existingReaction) {
        const updateReactionResult = await toolReactions.updateOne(
          { _id: existingReaction._id },
          { $set: { updatedAt: new Date(), value } },
        );

        if (!updateReactionResult.acknowledged) {
          return reply.code(500).send({
            message: "Internal server error",
            success: false,
          });
        }
      }

      const updatedTool = await tools.findOneAndUpdate(
        { _id: tool._id },
        { $inc: getToolStatsDelta(action, value) },
        {
          projection: { "stats.downvotes": 1, "stats.upvotes": 1 },
          returnDocument: "after",
        },
      );

      if (!updatedTool) {
        return reply.code(404).send({
          message: "Tool not found",
          success: false,
        });
      }

      return reply.code(200).send({
        data: {
          reaction,
          stats: {
            downvotes: updatedTool.stats.downvotes,
            upvotes: updatedTool.stats.upvotes,
          },
        },
        message: "Tool reaction updated successfully",
        success: true,
      });
    },
    method: "POST",
    onRequest: [fastify.requireStatus("active")],
    schema: {
      body: setToolReactionBodySchema,
      params: setToolReactionParamsSchema,
      response: setToolReactionResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Tools"],
    },
    url: "/reaction",
  });
};

export default setToolReaction;
