import { authClient } from "@/lib/auth-client";

export async function signIn(
  ...params: Parameters<typeof authClient.signIn.email>
) {
  return authClient.signIn.email(...params);
}
