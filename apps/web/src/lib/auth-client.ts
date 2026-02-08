import { env } from "@/env";
import {
  inferAdditionalFields,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_BASE_URL,
  plugins: [
    usernameClient(),
    inferAdditionalFields({
      user: {
        username: { type: "string", input: true },
        displayUsername: { type: "string", input: true },
        role: { type: ["guest", "contributor", "moderator"], input: false },
        status: { type: ["active", "restricted", "banned"], input: false },
      },
    }),
  ],
});

export type Session = typeof authClient.$Infer.Session;
