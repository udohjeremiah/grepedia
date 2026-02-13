import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { authClient } from "@/lib/auth-client";

export const getSession = createIsomorphicFn()
  .server(async () => {
    const session = await authClient.getSession({
      fetchOptions: { headers: getRequestHeaders() },
    });
    return session.data;
  })
  .client(async () => {
    const session = await authClient.getSession();
    return session.data;
  });
