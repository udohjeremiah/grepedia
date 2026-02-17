import { authClient } from "@/lib/auth-client";

export async function deleteUser(
  ...params: Parameters<typeof authClient.deleteUser>
) {
  return authClient.deleteUser(...params);
}
