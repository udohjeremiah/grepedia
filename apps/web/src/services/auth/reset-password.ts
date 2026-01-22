import { authClient } from "@/lib/auth-client";

export async function resetPassword(
  ...args: Parameters<typeof authClient.resetPassword>
) {
  return authClient.resetPassword(...args);
}
