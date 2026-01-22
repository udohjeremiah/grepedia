import { authClient } from "@/lib/auth-client";

export async function signUp(
  ...args: Parameters<typeof authClient.signUp.email>
) {
  return authClient.signUp.email(...args);
}
