import { authClient } from "@/lib/auth-client";

export async function signOut(
  ...params: Parameters<typeof authClient.signOut>
) {
  return authClient.signOut(...params);
}
