import { env } from "@/env";
import { authClient } from "@/lib/auth-client";

type SignUp = {
  name: string;
  email: string;
  password: string;
};

export async function signUp(value: SignUp) {
  return authClient.signUp.email({
    name: value.name,
    email: value.email,
    password: value.password,
    callbackURL: `${env.VITE_BASE_URL}/signin`,
  });
}
