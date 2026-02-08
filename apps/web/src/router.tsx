import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import DefaultError from "@/components/default-error";
import DefaultNotFound from "@/components/default-not-found";
import { getContext } from "@/providers/tanstack-query-provider";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
  const rqContext = getContext();

  const router = createRouter({
    context: {
      ...rqContext,
    },
    defaultErrorComponent: DefaultError,
    defaultNotFoundComponent: DefaultNotFound,
    defaultPreload: "intent",
    routeTree,
  });

  setupRouterSsrQueryIntegration({
    queryClient: rqContext.queryClient,
    router,
  });

  return router;
};
