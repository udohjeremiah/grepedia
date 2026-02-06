import { authClient } from "@/lib/auth-client";
import { createAuthHooks } from "@daveyplate/better-auth-tanstack";

type AuthClient = typeof authClient;
type AuthHooks = ReturnType<typeof createAuthHooks<AuthClient>>;

export const auth: AuthHooks = createAuthHooks(authClient);
