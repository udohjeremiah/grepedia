import { authClient } from "@/lib/auth-client";

export async function signUp(
  ...params: Parameters<typeof authClient.signUp.email>
) {
  return authClient.signUp.email(...params);
}
