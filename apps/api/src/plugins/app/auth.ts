import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { betterAuth } from "better-auth/minimal";
import { username } from "better-auth/plugins";
import fp from "fastify-plugin";

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
      trustedOrigins: [fastify.env.CLIENT_BASE_URL],
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

            let username = emailWithoutDomain
              .toLowerCase()
              .replace(/^\d+|\d+$/g, "");
            let response = await auth.api.isUsernameAvailable({
              body: { username },
            });

            while (!response.available) {
              const randomSuffix = Math.floor(Math.random() * 1_000_000_000);
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
                  username: username,
                  displayUsername: username,
                },
              },
            };
          }

          return;
        }),
      },
      emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url }) => {
          void fastify.resend.emails.send({
            from: fastify.env.EMAIL_AUTH,
            to: user.email,
            subject: "Reset your password",
            text: `Click the link to reset your password: ${url}`,
          });
        },
      },
      emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url }) => {
          void fastify.resend.emails.send({
            from: fastify.env.EMAIL_AUTH,
            to: user.email,
            subject: "Verify your email address",
            text: `Click the link to verify your email: ${url}`,
          });
        },
      },
      plugins: [username()],
      database: mongodbAdapter(fastify.getDatabase()),
      experimental: { joins: true },
      user: {
        additionalFields: {
          username: {
            type: "string",
            unique: true,
            required: true,
            input: true,
          },
          displayUsername: {
            type: "string",
            required: true,
            input: true,
          },
          role: {
            type: ["guest", "contributor", "moderator"],
            required: true,
            defaultValue: "guest",
            input: false,
          },
          status: {
            type: ["active", "restricted", "banned"],
            required: true,
            defaultValue: "active",
            input: false,
          },
        },
      },
      session: {
        cookieCache: {
          enabled: true,
          maxAge: 5 * 60,
        },
      },
    });

    fastify.decorate("auth", auth);
  },
  { name: "auth", dependencies: ["database", "resend"] },
);
