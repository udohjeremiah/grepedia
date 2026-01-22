import { betterAuth } from "better-auth/minimal";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
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
      trustedOrigins: [fastify.env.CLIENT_BASE_URL],
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
      database: mongodbAdapter(fastify.getDatabase()),
      experimental: { joins: true },
      user: {
        additionalFields: {
          username: {
            type: "string",
            unique: true,
            required: true,
            defaultValue: "",
            input: false,
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
      databaseHooks: {
        user: {
          create: {
            before: async (user) => {
              const users = fastify.getUserCollection();

              const baseUsername = (user.email.split("@")[0] ?? "user").replace(
                /^\d+|\d+$/g,
                "",
              );

              let username = baseUsername;
              let suffix = 0;
              while (await users.findOne({ username })) {
                suffix += 1;
                username = `${baseUsername}${suffix}`;
              }

              return { data: { ...user, username } };
            },
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
