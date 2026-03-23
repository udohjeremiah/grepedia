import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { canonicalStringify } from "@workspace/shared/canonical-stringify";
import {
  getUserRecoveryPackageParamsSchema,
  getUserRecoveryPackageResponseSchemas,
} from "@workspace/shared/schemas/users/recovery-package/get-user-recovery-package";
import { ObjectId } from "mongodb";
import { createHmac, randomUUID } from "node:crypto";

import { serializeMongoTypes } from "@/utils/serialize-mongo-types.js";

const getUserRecoveryPackage: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    handler: async function (request, reply) {
      const { userId } = request.params;

      const users = fastify.getUserCollection();
      const userBookmarks = fastify.getUserBookmarkCollection();
      const tools = fastify.getToolCollection();
      const toolReactions = fastify.getToolReactionCollection();
      const toolComments = fastify.getToolCommentCollection();
      const toolCommentReactions = fastify.getToolCommentReactionCollection();

      const userObjectId = ObjectId.createFromHexString(userId);
      const [
        user,
        bookmarkDocuments,
        toolDocuments,
        toolReactionDocuments,
        commentDocuments,
        commentReactionDocuments,
      ] = await Promise.all([
        users.findOne({ _id: userObjectId }),
        userBookmarks.find({ userId: userObjectId }).toArray(),
        tools
          .find({
            $or: [{ addedBy: userObjectId }, { updatedBy: userObjectId }],
          })
          .toArray(),
        toolReactions.find({ userId: userObjectId }).toArray(),
        toolComments.find({ userId: userObjectId }).toArray(),
        toolCommentReactions.find({ userId: userObjectId }).toArray(),
      ]);

      if (!user) {
        return reply.code(404).send({
          message: "User not found",
          success: false,
        });
      }

      const snapshot = serializeMongoTypes({
        bookmarks: bookmarkDocuments,
        commentReactions: commentReactionDocuments,
        comments: commentDocuments,
        toolReactions: toolReactionDocuments,
        tools: toolDocuments,
        user,
      });

      const issuedAt = new Date();
      const expiresAt = new Date(issuedAt);
      expiresAt.setUTCFullYear(expiresAt.getUTCFullYear() + 1);

      const payload = {
        app: "grepedia" as const,
        data: snapshot,
        expiresAt: expiresAt.toISOString(),
        exportId: randomUUID(),
        issuedAt: issuedAt.toISOString(),
        userId,
        version: 1 as const,
      };

      const signature = createHmac(
        "sha256",
        fastify.env.USER_DATA_EXPORT_SIGNING_SECRET,
      )
        .update(canonicalStringify(payload))
        .digest("base64url");

      return reply.code(200).send({
        data: {
          recoveryPackage: {
            format: "grepedia-recovery/v1",
            payload,
            proof: {
              alg: "HS256",
              kid: "user-data-hmac-v1",
              sig: signature,
            },
          },
        },
        message: "User recovery package retrieved successfully",
        success: true,
      });
    },
    method: "GET",
    onRequest: [fastify.requireUserId()],
    schema: {
      params: getUserRecoveryPackageParamsSchema,
      response: getUserRecoveryPackageResponseSchemas,
      security: [{ sessionCookie: [] }],
      tags: ["Users"],
    },
    url: "/recovery-package",
  });
};

export default getUserRecoveryPackage;
