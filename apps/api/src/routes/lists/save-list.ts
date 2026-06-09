import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { slugifyWithCounter } from "@sindresorhus/slugify";
import {
  saveListBodySchema,
  saveListResponseSchemas,
} from "@workspace/shared/schemas/lists/save-list";
import { ObjectId } from "mongodb";

import { normalizeListTools } from "@/utils/normalize-list-tools.js";

const saveList: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      if (!request.user) throw new Error("User not authenticated");

      const body = request.body;

      const lists = fastify.db.lists;
      const tools = fastify.db.tools;

      const userId = ObjectId.createFromHexString(request.user.id);
      const slug = body.slug;

      const list = slug
        ? await lists.findOne({ createdBy: userId, slug })
        : undefined;

      if (slug && !list) {
        return reply.code(404).send({
          message: "List not found",
          success: false,
        });
      }

      if (list && list.status !== "draft") {
        return reply.code(409).send({
          message: "Only draft lists can be edited",
          success: false,
        });
      }

      const items = normalizeListTools(body.tools);
      const toolIds = items.map((tool) => tool.toolId);
      const existingToolCount = await tools.countDocuments({
        _id: { $in: toolIds },
        status: "published",
      });

      if (existingToolCount !== new Set(toolIds.map(String)).size) {
        return reply.code(422).send({
          message: "One or more selected tools could not be found",
          success: false,
        });
      }

      const slugify = slugifyWithCounter();
      let listSlug = slugify(body.title, { decamelize: false });
      while (
        await lists.findOne({
          slug: listSlug,
          ...(list?._id ? { _id: { $ne: list._id } } : {}),
        })
      ) {
        listSlug = slugify(body.title, { decamelize: false });
      }

      const now = new Date();
      let resolvedListId: string;

      if (slug) {
        const updateResult = await lists.updateOne(
          { createdBy: userId, slug },
          {
            $set: {
              description: body.description,
              slug: listSlug,
              title: body.title,
              tools: items,
              updatedAt: now,
            },
          },
        );

        if (!updateResult.acknowledged) {
          return reply.code(500).send({
            message: "Internal server error",
            success: false,
          });
        }

        resolvedListId = list!._id.toString();
      } else {
        const insertResult = await lists.insertOne({
          createdAt: now,
          createdBy: userId,
          description: body.description,
          slug: listSlug,
          stats: { bookmarks: 0, downvotes: 0, upvotes: 0, views: 0 },
          status: "draft",
          title: body.title,
          tools: items,
        });

        if (!insertResult.acknowledged) {
          return reply.code(500).send({
            message: "Internal server error",
            success: false,
          });
        }

        resolvedListId = insertResult.insertedId.toString();
      }

      return reply.code(201).send({
        data: { listId: resolvedListId, listSlug, savedAt: now.toISOString() },
        message: "List saved successfully",
        success: true,
      });
    },
    method: "POST",
    onRequest: [fastify.requireStatus("active")],
    schema: {
      body: saveListBodySchema,
      response: saveListResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Lists"],
    },
    url: "/",
  });
};

export default saveList;
