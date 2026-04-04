import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from "@/components/error-fallback";

import Directory from "./-components/directory";
import { toolsDirectoryCategoriesQueryOptions } from "./-queries/tools-directory-categories";

export const Route = createFileRoute("/_authenticated/tools/directory/")({
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: "Tools Directory • Grepedia" },
      {
        content:
          "Browse the full Grepedia tools directory and discover tools from around the world.",
        name: "description",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(toolsDirectoryCategoriesQueryOptions());
  },
});

function RouteComponent() {
  return (
    <main className="flex flex-1 p-4 sm:px-8 md:px-16">
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            FallbackComponent={({ resetErrorBoundary }) => (
              <ErrorFallback
                description="Something unexpected happened, so we couldn't load the directory. Click the button below to try again."
                onRetry={resetErrorBoundary}
              />
            )}
            onReset={reset}
          >
            <Directory />
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </main>
  );
}
