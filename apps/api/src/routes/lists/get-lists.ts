import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  getListsQueryStringSchema,
  getListsResponseSchemas,
} from "@workspace/shared/schemas/lists/get-lists";
import { omitKeys } from "@workspace/shared/utils/omit-keys";
import { ObjectId } from "mongodb";

import { serializeMongoTypes } from "@/utils/serialize-mongo-types.js";

const getLists: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { createdBy } = request.query;

      const lists = fastify.db.lists;

      const listDocuments = await lists
        .find(
          createdBy
            ? { createdBy: ObjectId.createFromHexString(createdBy) }
            : // eslint-disable-next-line unicorn/no-array-callback-reference
              ({ status: "published" } as const),
        )
        // eslint-disable-next-line unicorn/no-array-sort
        .sort(
          createdBy
            ? ({ createdAt: -1, updatedAt: -1 } as const)
            : ({
                _id: -1,
                publishedAt: -1,
                "stats.downvotes": 1,
                "stats.upvotes": -1,
              } as const),
        )
        .limit(50)
        .toArray();

      const listsResponse = listDocuments.map((list) => {
        const result = serializeMongoTypes(list);
        return {
          ...omitKeys(result, ["tools"]),
          toolCount: result.tools.length,
        };
      });

      return reply.code(200).send({
        data: { lists: listsResponse },
        message: "Lists retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    schema: {
      querystring: getListsQueryStringSchema,
      response: getListsResponseSchemas,
      tags: ["Lists"],
    },
    url: "/",
  });
};

export default getLists;
