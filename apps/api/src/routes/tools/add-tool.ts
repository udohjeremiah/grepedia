import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { slugifyWithCounter } from "@sindresorhus/slugify";
import { omitKeys } from "@workspace/shared/omit-keys";
import {
  addToolBodySchema,
  addToolResponseSchemas,
} from "@workspace/shared/schemas/tools/add-tool";
import { ObjectId } from "mongodb";

import { ToolWithObjectIds } from "@/schemas/tools/tool.js";
import { serializeMongoTypes } from "@/utils/serialize-mongo-types.js";

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
      //   ${body.short_description}
      //   ${body.long_description}
      //   Categories: ${body.categories.join(", ")}
      //   Tags: ${body.tags.join(", ")}
      //   Released at: ${body.released_at ?? "N/A"}
      // `;
      // const vecEmbed = await fastify.generateVectorEmbeddings(textToEmbed);

      const tool: Omit<ToolWithObjectIds, "_id"> = {
        ...body,
        added_at: new Date().toISOString(),
        added_by: ObjectId.createFromHexString(request.user.id),
        slug,
        stats: { comments: 0, downvotes: 0, upvotes: 0 },
        status: "published",
      };

      const result = await tools.insertOne(tool);
      const toolWithStringIds = serializeMongoTypes({
        ...omitKeys(tool, ["vectorEmbeddings"]),
        _id: result.insertedId,
      });

      return reply.code(201).send({
        data: { tool: toolWithStringIds },
        message: "Tool added successfully",
        success: true,
      });
    },
    method: "POST",
    onRequest: fastify.requireUser,
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
