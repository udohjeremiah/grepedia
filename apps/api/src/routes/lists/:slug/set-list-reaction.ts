import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  setListReactionBodySchema,
  setListReactionParamsSchema,
  setListReactionResponseSchemas,
} from "@workspace/shared/schemas/lists/reactions/set-list-reaction";
import { ObjectId } from "mongodb";

import { getOfficialListBySlug } from "@/utils/official-lists.js";

type ReactionAction = "delete" | "insert" | "update";
type ReactionValue = -1 | 1;

function getListStatsDelta(action: ReactionAction, value: ReactionValue) {
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

const setListReaction: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      if (!request.user) throw new Error("User not authenticated");

      const { slug } = request.params;
      const { value } = request.body;

      if (getOfficialListBySlug(slug)) {
        return reply.code(403).send({
          message: "Official lists cannot be reacted to",
          success: false,
        });
      }

      const lists = fastify.db.lists;
      const listReactions = fastify.db.listReactions;

      const list = await lists.findOne(
        { slug, status: "published" },
        { projection: { _id: 1 } },
      );

      if (!list) {
        return reply.code(404).send({
          message: "List not found",
          success: false,
        });
      }

      const userId = ObjectId.createFromHexString(request.user.id);
      const existingReaction = await listReactions.findOne({
        listId: list._id,
        userId,
      });

      const { action, reaction } = resolveReactionAction(
        existingReaction?.value,
        value,
      );

      if (action === "insert") {
        const now = new Date();

        const insertResult = await listReactions.insertOne({
          createdAt: now,
          listId: list._id,
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
        const deleteResult = await listReactions.deleteOne({
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
        const updateReactionResult = await listReactions.updateOne(
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

      const updatedList = await lists.findOneAndUpdate(
        { _id: list._id },
        { $inc: getListStatsDelta(action, value) },
        {
          projection: { "stats.downvotes": 1, "stats.upvotes": 1 },
          returnDocument: "after",
        },
      );

      if (!updatedList) {
        return reply.code(404).send({
          message: "List not found",
          success: false,
        });
      }

      return reply.code(200).send({
        data: {
          reaction,
          stats: {
            downvotes: updatedList.stats.downvotes,
            upvotes: updatedList.stats.upvotes,
          },
        },
        message: "List reaction updated successfully",
        success: true,
      });
    },
    method: "POST",
    onRequest: [fastify.requireStatus("active")],
    schema: {
      body: setListReactionBodySchema,
      params: setListReactionParamsSchema,
      response: setListReactionResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Lists"],
    },
    url: "/reaction",
  });
};

export default setListReaction;
