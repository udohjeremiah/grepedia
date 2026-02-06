import DefaultError from "@/components/default-error";
import DefaultNotFound from "@/components/default-not-found";
import { getContext } from "@/providers/tanstack-query-provider";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
  const rqContext = getContext();

  const router = createRouter({
    routeTree,
    context: {
      ...rqContext,
    },
    defaultPreload: "intent",
    defaultNotFoundComponent: DefaultNotFound,
    defaultErrorComponent: DefaultError,
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient: rqContext.queryClient,
  });

  return router;
};
