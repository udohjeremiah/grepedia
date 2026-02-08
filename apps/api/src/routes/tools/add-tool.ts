import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { slugifyWithCounter } from "@sindresorhus/slugify";
import { omitKeys } from "@workspace/shared/omit-keys";
import {
  addTool201ResponseSchema,
  addToolBodySchema,
} from "@workspace/shared/schemas/add-tool";
import { ObjectId } from "mongodb";
import { z } from "zod";

import type { ToolWithObjectIds } from "@/schemas/tool.js";

import { convertObjectIdsToStrings } from "@/utils/convert-objectids-to-string.js";

const addTool: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      if (!request.user) {
        throw new Error("User not authenticated");
      }

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
        added_by: new ObjectId(request.user.id),
        // eslint-disable-next-line unicorn/no-null
        owner: null,
        slug,
        stats: { comments: 0, downvotes: 0, upvotes: 0 },
        status: "published",
        // eslint-disable-next-line unicorn/no-null
        updated_at: null,
        // eslint-disable-next-line unicorn/no-null
        updated_by: null,
        vectorEmbeddings: [],
      };

      const result = await tools.insertOne(tool);
      const toolWithStringIds = convertObjectIdsToStrings({
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
    schema: {
      body: addToolBodySchema,
      response: {
        201: addTool201ResponseSchema,
        default: z.object({
          data: z.unknown().optional(),
          message: z.string(),
          success: z.boolean(),
        }),
      },
    },
    url: "/",
  });
};

export default addTool;
