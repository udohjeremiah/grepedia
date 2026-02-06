import { authClient } from "@/lib/auth-client";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

export const getAuthSession = createIsomorphicFn()
  .server(async () => {
    const session = await authClient.getSession({
      fetchOptions: { headers: getRequestHeaders() },
    });
    return session.data?.session;
  })
  .client(async () => {
    const session = await authClient.getSession();
    return session.data?.session;
  });
