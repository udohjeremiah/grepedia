import {
  inferAdditionalFields,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { env } from "@/env";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_BASE_URL,
  plugins: [
    usernameClient(),
    inferAdditionalFields({
      user: {
        bio: { input: true, required: false, type: "string" },
        displayUsername: { input: false, type: "string" },
        role: { input: false, type: ["member", "contributor", "moderator"] },
        status: { input: false, type: ["active", "suspended", "deactivated"] },
        username: { input: false, type: "string" },
      },
    }),
  ],
});

export type Session = typeof authClient.$Infer.Session;
