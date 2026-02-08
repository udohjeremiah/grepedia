import { authClient } from "@/lib/auth-client";

export async function requestPasswordReset(
  ...params: Parameters<typeof authClient.requestPasswordReset>
) {
  return authClient.requestPasswordReset(...params);
}
