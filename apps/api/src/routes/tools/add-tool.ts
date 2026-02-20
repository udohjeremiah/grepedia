import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { slugifyWithCounter } from "@sindresorhus/slugify";
import {
  addToolBodySchema,
  addToolResponseSchemas,
} from "@workspace/shared/schemas/tools/add-tool";
import { ObjectId } from "mongodb";

const addTool: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      if (!request.user) throw new Error("User not authenticated");

      const body = request.body;
      const tools = fastify.getToolCollection();

      const slugify = slugifyWithCounter();
      let slug = slugify(body.name);
      while (await tools.findOne({ slug })) {
        slug = slugify(body.name);
      }

      // Future vector embeddings implementation:
      // const textToEmbed = `
      //   ${body.name}
      //   ${body.shortDescription}
      //   ${body.longDescription}
      //   Categories: ${body.categories.join(", ")}
      //   Tags: ${body.tags.join(", ")}
      //   Released at: ${body.releasedAt ?? "N/A"}
      // `;
      // const vecEmbed = await fastify.generateVectorEmbeddings(textToEmbed);

      const addedAt = new Date().toISOString();
      const insertResult = await tools.insertOne({
        ...body,
        addedAt,
        addedBy: ObjectId.createFromHexString(request.user.id),
        slug,
        stats: { comments: 0, downvotes: 0, upvotes: 0 },
        status: "published",
      });

      if (!insertResult.acknowledged) {
        return reply.code(500).send({
          message: "Internal server error",
          success: false,
        });
      }

      return reply.code(201).send({
        data: {
          addedAt,
          toolId: insertResult.insertedId.toString(),
          toolSlug: slug,
        },
        message: "Tool added successfully",
        success: true,
      });
    },
    method: "POST",
    onRequest: [fastify.requireUser],
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
