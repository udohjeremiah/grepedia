import fp from "fastify-plugin";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { User } from "better-auth";

type AppUser = User & {
  username: string;
  role: "guest" | "contributor" | "moderator";
  status: "active" | "restricted" | "banned";
};

declare module "fastify" {
  interface FastifyInstance {
    requireUser: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;

    requireRole: (
      role: AppUser["role"],
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

    requireStatus: (
      status: AppUser["status"],
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
          success: false,
          message: "Unauthorized",
        });
      }

      request.user = session.user as AppUser;
    };

    const requireRole =
      (role: AppUser["role"]) =>
      async (request: FastifyRequest, reply: FastifyReply) => {
        await requireUser(request, reply);
        if (request.user?.role !== role) {
          return reply.code(403).send({
            success: false,
            message: "Forbidden",
          });
        }
      };

    const requireStatus =
      (status: AppUser["status"]) =>
      async (request: FastifyRequest, reply: FastifyReply) => {
        await requireUser(request, reply);
        if (request.user?.status !== status) {
          return reply.code(403).send({
            success: false,
            message: "Forbidden",
          });
        }
      };

    fastify.decorate("requireUser", requireUser);
    fastify.decorate("requireRole", requireRole);
    fastify.decorate("requireStatus", requireStatus);
  },
  { name: "authorization", dependencies: ["auth"] },
);
