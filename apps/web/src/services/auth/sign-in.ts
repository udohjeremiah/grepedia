import { authClient } from "@/lib/auth-client";

type SignIn = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export async function signIn(value: SignIn) {
  return authClient.signIn.email({
    email: value.email,
    password: value.password,
    rememberMe: value.rememberMe,
  });
}
