import { env } from "@/env";
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_BASE_URL,
  plugins: [
    inferAdditionalFields({
      user: {
        username: { type: "string", input: false },
        role: { type: ["guest", "contributor", "moderator"], input: false },
        status: { type: ["active", "restricted", "banned"], input: false },
      },
    }),
  ],
});

export type Session = typeof authClient.$Infer.Session;
