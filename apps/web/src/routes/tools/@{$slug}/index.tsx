import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from "@/components/error-fallback";

import Tool from "./-components/tool";
import { toolCommentsQueryOptions } from "./-queries/tool-comments";

export const Route = createFileRoute("/tools/@{$slug}/")({
  component: RouteComponent,
  loader: ({ context, params }) => {
    context.queryClient.prefetchInfiniteQuery(
      toolCommentsQueryOptions({ params }),
    );
  },
});

function RouteComponent() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          FallbackComponent={({ resetErrorBoundary }) => (
            <ErrorFallback
              description="Something unexpected happened, so we couldn't load this tool page. Click the button below to try again."
              onRetry={resetErrorBoundary}
            />
          )}
          onReset={reset}
        >
          <Tool />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
