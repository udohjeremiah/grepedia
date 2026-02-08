import { authClient } from "@/lib/auth-client";

export async function resetPassword(
  ...params: Parameters<typeof authClient.resetPassword>
) {
  return authClient.resetPassword(...params);
}
