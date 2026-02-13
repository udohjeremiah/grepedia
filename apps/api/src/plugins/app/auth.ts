import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { betterAuth } from "better-auth/minimal";
import { username } from "better-auth/plugins";
import fp from "fastify-plugin";
import { randomInt } from "node:crypto";

declare module "fastify" {
  interface FastifyInstance {
    auth: ReturnType<typeof betterAuth>;
  }
}

/**
 * This plugin initializes and configures
 * authentication using Better Auth.
 *
 * @see {@link https://better-auth.com}
 */
export default fp(
  async (fastify) => {
    const auth = betterAuth({
      advanced: {
        cookiePrefix: "grepedia",
      },
      database: mongodbAdapter(fastify.getDatabase()),
      emailAndPassword: {
        autoSignIn: false,
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ url, user }) => {
          fastify.resend.emails.send({
            from: fastify.env.EMAIL_AUTH,
            subject: "Reset your password",
            text: `Click the link to reset your password: ${url}`,
            to: user.email,
          });
        },
      },
      emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async ({ url, user }) => {
          fastify.resend.emails.send({
            from: fastify.env.EMAIL_AUTH,
            subject: "Verify your email address",
            text: `Click the link to verify your email: ${url}`,
            to: user.email,
          });
        },
      },
      experimental: { joins: true },
      hooks: {
        before: createAuthMiddleware(async (context) => {
          if (context.path === "/sign-up/email") {
            const email = context.body.email as string;
            const emailWithoutDomain = email.split("@")[0];
            if (!emailWithoutDomain) {
              throw new APIError("BAD_REQUEST", {
                message: "Invalid email address",
              });
            }

            let username = emailWithoutDomain.toLowerCase();
            let response = await auth.api.isUsernameAvailable({
              body: { username },
            });

            while (!response.available) {
              const randomSuffix = randomInt(1_000_000_000);
              username = `${username}${randomSuffix}`;
              response = await auth.api.isUsernameAvailable({
                body: { username },
              });
            }

            return {
              context: {
                ...context,
                body: {
                  ...context.body,
                  displayUsername: username,
                  username: username,
                },
              },
            };
          }

          return { context };
        }),
      },
      plugins: [username()],
      session: {
        cookieCache: {
          enabled: true,
          maxAge: 5 * 60,
        },
      },
      trustedOrigins: [fastify.env.CLIENT_BASE_URL],
      user: {
        additionalFields: {
          bio: {
            input: true,
            required: false,
            type: "string",
          },
          displayUsername: {
            input: true,
            required: true,
            type: "string",
          },
          role: {
            defaultValue: "member",
            input: false,
            required: true,
            type: ["member", "contributor", "moderator"],
          },
          status: {
            defaultValue: "active",
            input: false,
            required: true,
            type: ["active", "suspended", "deactivated"],
          },
          username: {
            input: true,
            required: true,
            type: "string",
            unique: true,
          },
        },
      },
    });

    fastify.decorate("auth", auth);
  },
  { dependencies: ["database", "resend"], name: "auth" },
);
