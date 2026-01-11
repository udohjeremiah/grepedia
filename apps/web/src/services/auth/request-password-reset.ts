import { env } from "@/env";
import { authClient } from "@/lib/auth-client";

type ForgotPassword = {
  email: string;
};

export async function requestPasswordReset(value: ForgotPassword) {
  return authClient.requestPasswordReset({
    email: value.email,
    redirectTo: `${env.VITE_BASE_URL}/reset-password`,
  });
}
