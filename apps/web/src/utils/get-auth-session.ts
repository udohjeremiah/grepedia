import { authClient } from "@/lib/auth-client";
import { createServerOnlyFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

export const getAuthSession = createServerOnlyFn(async () => {
  const session = await authClient.getSession({
    fetchOptions: { headers: getRequestHeaders() },
  });

  return session.data?.session;
});
