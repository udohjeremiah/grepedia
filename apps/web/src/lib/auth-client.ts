import type { BetterAuthClientPlugin } from "better-auth/client";

import {
  inferAdditionalFields,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { env } from "@/env";

export const authClient = createAuthClient({
  basePath: "/auth",
  baseURL: env.VITE_API_BASE_URL,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    usernameClient(),
    inferAdditionalFields({
      user: {
        bio: { input: true, required: false, type: "string" },
        country: { input: true, required: false, type: "string" },
        displayUsername: { input: false, type: "string" },
        gender: {
          input: true,
          required: false,
          type: ["male", "female", "nonBinary", "other", "preferNotToSay"],
        },
        role: { input: false, type: ["member", "contributor", "moderator"] },
        status: {
          input: false,
          type: ["active", "flagged", "suspended", "deactivated"],
        },
        username: { input: false, type: "string" },
      },
    }),
  ] satisfies BetterAuthClientPlugin[],
});

export type Session = typeof authClient.$Infer.Session;
