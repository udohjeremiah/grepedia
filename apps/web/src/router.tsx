import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import { tanstackQueryClient } from "./lib/tanstack-query-client";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
  const queryClient = tanstackQueryClient();

  const router = createRouter({
    context: { queryClient },
    defaultPreload: "intent",
    routeTree,
  });

  setupRouterSsrQueryIntegration({
    queryClient,
    router,
  });

  return router;
};
