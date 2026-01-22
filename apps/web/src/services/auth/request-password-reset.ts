import { authClient } from "@/lib/auth-client";

export async function requestPasswordReset(
  ...args: Parameters<typeof authClient.requestPasswordReset>
) {
  return authClient.requestPasswordReset(...args);
}
