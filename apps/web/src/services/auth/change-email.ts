import { authClient } from "@/lib/auth-client";

export async function changeEmail(
  ...params: Parameters<typeof authClient.changeEmail>
) {
  return authClient.changeEmail(...params);
}
