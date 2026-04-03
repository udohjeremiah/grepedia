import type { FastifyInstance } from "fastify";

import { adventurer } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { buildEmail } from "@workspace/transactional/build-email";
import ChangeEmailConfirmationEmail from "@workspace/transactional/emails/change-email-confirmation-email";
import DeleteAccountVerificationEmail from "@workspace/transactional/emails/delete-account-verification-email";
import ResetPasswordEmail from "@workspace/transactional/emails/reset-password-email";
import VerificationEmail from "@workspace/transactional/emails/verification-email";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { betterAuth } from "better-auth/minimal";
import { username } from "better-auth/plugins";
import fp from "fastify-plugin";
import { randomInt } from "node:crypto";

export type AuthInstance = ReturnType<typeof createAuth>;
export type AuthSession = AuthInstance["$Infer"]["Session"]["session"];
export type AuthUser = AuthInstance["$Infer"]["Session"]["user"];

declare module "fastify" {
  interface FastifyInstance {
    auth: AuthInstance;
  }
}

// NOTE: Intentional type-only export to keep `createAuth`'s return type
// portable and prevent pnpm-internal type paths from surfacing in compiler
// diagnostics.
/** @internal */
export type { Auth as _ } from "better-auth";

function createAuth(fastify: FastifyInstance) {
  const auth = betterAuth({
    advanced: {
      cookiePrefix: "grepedia",
      // Use cross-site cookies in production (SameSite=None + Secure) so auth
      // works across client/API origins. In dev, fall back to SameSite=Lax to
      // allow HTTP on localhost where Secure cookies would be rejected.
      defaultCookieAttributes: {
        sameSite: fastify.env.NODE_ENV === "production" ? "none" : "lax",
        secure: fastify.env.NODE_ENV === "production",
      },
    },
    basePath: "/auth",
    baseURL: fastify.env.BASE_URL,
    database: mongodbAdapter(fastify.getDatabase()),
    emailAndPassword: {
      autoSignIn: false,
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ url, user }) => {
        const html = await buildEmail({
          component: ResetPasswordEmail,
          props: {
            logo: `${fastify.env.CLIENT_BASE_URL}/favicon-96x96.png`,
            resetLink: url,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            username: (user as any).displayUsername,
          },
        });

        fastify.resend.emails.send({
          from: fastify.env.EMAIL_AUTH,
          html,
          subject: "Reset your password",
          text: `Click the link to reset your password: ${url}`,
          to: user.email,
        });
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendVerificationEmail: async ({ url, user }) => {
        const html = await buildEmail({
          component: VerificationEmail,
          props: {
            fullName: user.name,
            logo: `${fastify.env.CLIENT_BASE_URL}/favicon-96x96.png`,
            verificationLink: url,
          },
        });

        fastify.resend.emails.send({
          from: fastify.env.EMAIL_AUTH,
          html,
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

          const baseUsername = emailWithoutDomain.toLowerCase();
          let username = baseUsername;
          let response = await auth.api.isUsernameAvailable({
            body: { username },
          });

          while (!response.available) {
            const randomSuffix = randomInt(1_000_000_000);
            username = `${baseUsername}${randomSuffix}`;
            response = await auth.api.isUsernameAvailable({
              body: { username },
            });
          }

          const avatar = createAvatar(adventurer, {
            backgroundColor: ["7fb3ff", "6a8dff", "5a6cff"],
            backgroundType: ["gradientLinear"],
            randomizeIds: true,
            seed: username,
          }).toDataUri();

          return {
            context: {
              ...context,
              body: {
                ...context.body,
                displayUsername: username,
                image: avatar,
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
        country: {
          input: true,
          required: false,
          type: "string",
        },
        displayUsername: {
          input: true,
          required: true,
          type: "string",
        },
        gender: {
          input: true,
          required: false,
          type: ["male", "female", "nonBinary", "other", "preferNotToSay"],
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
          type: ["active", "flagged", "suspended", "deactivated"],
        },
        username: {
          input: true,
          required: true,
          type: "string",
          unique: true,
        },
      },
      changeEmail: {
        enabled: true,
        sendChangeEmailConfirmation: async ({ newEmail, url, user }) => {
          const html = await buildEmail({
            component: ChangeEmailConfirmationEmail,
            props: {
              logo: `${fastify.env.CLIENT_BASE_URL}/favicon-96x96.png`,
              newEmail,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              username: (user as any).displayUsername,
              verificationLink: url,
            },
          });

          fastify.resend.emails.send({
            from: fastify.env.EMAIL_AUTH,
            html,
            subject: "Approve email change",
            text: `Click the link to approve the change to ${newEmail}: ${url}`,
            to: user.email,
          });
        },
      },
      deleteUser: {
        enabled: true,
        sendDeleteAccountVerification: async ({ url, user }) => {
          const html = await buildEmail({
            component: DeleteAccountVerificationEmail,
            props: {
              logo: `${fastify.env.CLIENT_BASE_URL}/favicon-96x96.png`,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              username: (user as any).displayUsername,
              verificationLink: url,
            },
          });

          fastify.resend.emails.send({
            from: fastify.env.EMAIL_AUTH,
            html,
            subject: "Verify account deletion",
            text: `Click the link to verify deleting your account: ${url}`,
            to: user.email,
          });
        },
      },
    },
  });

  return auth;
}

/**
 * This plugin initializes and configures
 * authentication using Better Auth.
 *
 * @see {@link https://better-auth.com}
 */
export default fp(
  async (fastify) => {
    const auth = createAuth(fastify);

    fastify.decorate("auth", auth);
  },
  { dependencies: ["database", "resend"], name: "auth" },
);
