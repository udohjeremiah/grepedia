import { authClient } from "@/lib/auth-client";

export async function signIn(
  ...args: Parameters<typeof authClient.signIn.email>
) {
  return authClient.signIn.email(...args);
}
