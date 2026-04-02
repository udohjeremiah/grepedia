import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { slugifyWithCounter } from "@sindresorhus/slugify";
import {
  addToolBodySchema,
  addToolResponseSchemas,
} from "@workspace/shared/schemas/tools/add-tool";
import { ObjectId } from "mongodb";

import { normalizeToolInput } from "@/utils/normalize-tool-input.js";

const addTool: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      if (!request.user) throw new Error("User not authenticated");

      const body = normalizeToolInput(request.body);
      const tools = fastify.getToolCollection();
      const toolRevisions = fastify.getToolRevisionCollection();
      const users = fastify.getUserCollection();

      const slugify = slugifyWithCounter();
      let slug = slugify(body.name, { decamelize: false });
      while (await tools.findOne({ slug })) {
        slug = slugify(body.name, { decamelize: false });
      }

      let embeddings: number[];
      try {
        const contentToEmbed = [
          body.name,
          body.shortDescription,
          body.longDescription,
          `Categories: ${body.categories.join(", ")}`,
          `Tags: ${body.tags.join(", ")}`,
          `Released at: ${body.releasedAt ?? "N/A"}`,
        ];
        embeddings = await fastify.generateEmbeddings(contentToEmbed);
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fastify.log.error("Embedding Error:", error as any);
        return reply.code(500).send({
          message: "Failed to generate tool embeddings",
          success: false,
        });
      }

      const addedAt = new Date();
      const userId = ObjectId.createFromHexString(request.user.id);
      const toolDocument = {
        ...body,
        addedAt,
        addedBy: userId,
        embeddings,
        releasedAt: body.releasedAt ? new Date(body.releasedAt) : undefined,
        slug,
        stats: { comments: 0, downvotes: 0, upvotes: 0 },
        status: "published" as const,
      };

      const insertResult = await tools.insertOne(toolDocument);

      if (!insertResult.acknowledged) {
        return reply.code(500).send({
          message: "Internal server error",
          success: false,
        });
      }

      const revisionInsertResult = await toolRevisions.insertOne({
        createdAt: addedAt,
        createdBy: userId,
        isRevert: false,
        revisionNumber: 1,
        snapshot: {
          ...body,
          releasedAt: body.releasedAt ? new Date(body.releasedAt) : undefined,
        },
        summary:
          "Created the initial tool listing with its basic details, description, and metadata.",
        title: "Initial tool publication",
        toolId: insertResult.insertedId,
        toolSlug: slug,
      });

      if (!revisionInsertResult.acknowledged) {
        return reply.code(500).send({
          message: "Internal server error",
          success: false,
        });
      }

      if (request.user.role === "member") {
        const promoteResult = await users.updateOne(
          { _id: userId, role: "member" },
          {
            $set: {
              role: "contributor",
              updatedAt: addedAt,
            },
          },
        );

        if (!promoteResult.acknowledged) {
          return reply.code(500).send({
            message: "Internal server error",
            success: false,
          });
        }
      }

      fastify.evaluateUserTrust(userId).catch((error: unknown) => {
        fastify.log.error(error);
      });

      return reply.code(201).send({
        data: {
          addedAt: addedAt.toISOString(),
          toolId: insertResult.insertedId.toString(),
          toolSlug: slug,
        },
        message: "Tool added successfully",
        success: true,
      });
    },
    method: "POST",
    onRequest: [fastify.requireStatus("active")],
    schema: {
      body: addToolBodySchema,
      response: addToolResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Tools"],
    },
    url: "/",
  });
};

export default addTool;
