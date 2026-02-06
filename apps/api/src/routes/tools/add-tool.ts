import type { ToolWithObjectIds } from "@/schemas/tool.js";
import { convertObjectIdsToStrings } from "@/utils/convert-objectids-to-string.js";
import { slugifyWithCounter } from "@sindresorhus/slugify";
import { omitKeys } from "@workspace/shared/omit-keys";
import {
  addTool201ResponseSchema,
  addToolBodySchema,
} from "@workspace/shared/schemas/add-tool";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { ObjectId } from "mongodb";
import { z } from "zod";

const addTool: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    method: "POST",
    url: "/",
    schema: {
      body: addToolBodySchema,
      response: {
        default: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.unknown().optional(),
        }),
        201: addTool201ResponseSchema,
      },
    },
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
        slug,
        owner: null,
        vectorEmbeddings: [],
        added_by: new ObjectId(request.user.id),
        added_at: new Date().toISOString(),
        updated_by: null,
        updated_at: null,
        stats: { upvotes: 0, downvotes: 0, comments: 0 },
        status: "published",
      };

      const result = await tools.insertOne(tool);
      const toolWithStringIds = convertObjectIdsToStrings({
        ...omitKeys(tool, ["vectorEmbeddings"]),
        _id: result.insertedId,
      });

      return reply.code(201).send({
        success: true,
        message: "Tool added successfully",
        data: { tool: toolWithStringIds },
      });
    },
  });
};

export default addTool;
