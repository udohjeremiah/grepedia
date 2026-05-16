import type { FastifyReply, FastifyRequest } from "fastify";

import { fromNodeHeaders } from "better-auth/node";
import fp from "fastify-plugin";

import type { AuthUser } from "@/plugins/app/auth.js";

declare module "fastify" {
  interface FastifyInstance {
    isAdminUserId: (userId: string) => boolean;

    requireModerator: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;

    requireRole: (
      role: AuthUser["role"],
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

    requireStatus: (
      status: AuthUser["status"],
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

    requireUser: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;

    requireUserId: (
      paramKey?: string,
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

    setUserIfPresent: (request: FastifyRequest) => Promise<void>;
  }

  interface FastifyRequest {
    user?: AuthUser;
  }
}

/**
 * This plugin adds authentication and authorization
 * guards for protecting routes via `onRequest` hooks.
 *
 * @see {@link https://better-auth.com}
 */
export default fp(
  async (fastify) => {
    const adminUserIds = new Set(
      fastify.env.ADMIN_USER_IDS.split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    );

    const isAdminUserId = (userId: string) => adminUserIds.has(userId);

    const setUserIfPresent = async (request: FastifyRequest) => {
      const session = await fastify.auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      request.user = session?.user;
    };

    const requireUser = async (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => {
      await setUserIfPresent(request);

      if (!request.user) {
        return reply.code(401).send({
          message: "Unauthorized",
          success: false,
        });
      }
    };

    const requireUserId =
      (paramKey = "userId") =>
      async (request: FastifyRequest, reply: FastifyReply) => {
        await requireUser(request, reply);
        if (reply.sent) return;

        const params = request.params as Record<string, unknown> | undefined;
        const id =
          typeof params?.[paramKey] === "string" ? params[paramKey] : undefined;

        if (!id || request.user?.id !== id) {
          return reply.code(403).send({
            message: "Forbidden",
            success: false,
          });
        }
      };

    const requireRole =
      (role: AuthUser["role"]) =>
      async (request: FastifyRequest, reply: FastifyReply) => {
        await requireUser(request, reply);
        if (reply.sent) return;

        if (
          !request.user?.id ||
          (!isAdminUserId(request.user.id) && request.user.role !== role)
        ) {
          return reply.code(403).send({
            message: "Forbidden",
            success: false,
          });
        }
      };

    const requireModerator = async (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => {
      await requireUser(request, reply);
      if (reply.sent) return;

      if (
        !request.user?.id ||
        (!isAdminUserId(request.user.id) && request.user.role !== "moderator")
      ) {
        return reply.code(403).send({
          message: "Forbidden",
          success: false,
        });
      }
    };

    const requireStatus =
      (status: AuthUser["status"]) =>
      async (request: FastifyRequest, reply: FastifyReply) => {
        await requireUser(request, reply);
        if (reply.sent) return;

        if (request.user?.status !== status) {
          return reply.code(403).send({
            message: "Forbidden",
            success: false,
          });
        }
      };

    fastify.decorate("isAdminUserId", isAdminUserId);
    fastify.decorate("setUserIfPresent", setUserIfPresent);
    fastify.decorate("requireUser", requireUser);
    fastify.decorate("requireUserId", requireUserId);
    fastify.decorate("requireRole", requireRole);
    fastify.decorate("requireModerator", requireModerator);
    fastify.decorate("requireStatus", requireStatus);
  },
  { dependencies: ["auth"], name: "authorization" },
);
