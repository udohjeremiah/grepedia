import { authClient } from "@/lib/auth-client";

type ResetPassword = {
  newPassword: string;
  token: string;
};

export async function resetPassword(value: ResetPassword) {
  return authClient.resetPassword({
    newPassword: value.newPassword,
    token: value.token,
  });
}
