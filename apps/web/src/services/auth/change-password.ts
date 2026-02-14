import { authClient } from "@/lib/auth-client";

export async function changePassword(
  ...params: Parameters<typeof authClient.changePassword>
) {
  return authClient.changePassword(...params);
}
