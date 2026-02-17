import type { User } from "better-auth";
import type { FastifyReply, FastifyRequest } from "fastify";

import fp from "fastify-plugin";

type AppUser = User & {
  displayName: string;
  role: "contributor" | "member" | "moderator";
  status: "active" | "deactivated" | "suspended";
  username: string;
};

declare module "fastify" {
  interface FastifyInstance {
    requireRole: (
      role: AppUser["role"],
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

    requireStatus: (
      status: AppUser["status"],
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

    requireUser: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;

    requireUserId: (
      paramKey?: string,
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    user?: AppUser;
  }
}

/**
 * This plugin provides authentication and
 * authorization guards built on top of
 * Better Auth sessions.
 *
 * It exposes reusable request guards that
 * can be attached via `onRequest` or
 * `preHandler` hooks.
 *
 * Available guards:
 * - requireUser: ensures the request is authenticated
 * - requireUserId: ensures the user id matches a route param id (defaults to `userId`)
 * - requireRole: ensures the user has a specific role
 * - requireStatus: ensures the user has a required account status
 */
export default fp(
  async (fastify) => {
    const requireUser = async (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => {
      const session = await fastify.auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user) {
        return reply.code(401).send({
          message: "Unauthorized",
          success: false,
        });
      }

      request.user = session.user as AppUser;
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
      (role: AppUser["role"]) =>
      async (request: FastifyRequest, reply: FastifyReply) => {
        await requireUser(request, reply);
        if (reply.sent) return;

        if (request.user?.role !== role) {
          return reply.code(403).send({
            message: "Forbidden",
            success: false,
          });
        }
      };

    const requireStatus =
      (status: AppUser["status"]) =>
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

    fastify.decorate("requireUser", requireUser);
    fastify.decorate("requireRole", requireRole);
    fastify.decorate("requireStatus", requireStatus);
    fastify.decorate("requireUserId", requireUserId);
  },
  { dependencies: ["auth"], name: "authorization" },
);
