import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from "@/components/error-fallback";

import Tool from "./-components/tool";
import ToolSkeleton from "./-components/tool-skeleton";
import { toolQueryOptions } from "./-queries/tool";
import { toolCommentsQueryOptions } from "./-queries/tool-comments";

export const Route = createFileRoute("/_authenticated/tools/@{$slug}/")({
  component: RouteComponent,
  loader: ({ context, params }) => {
    context.queryClient.prefetchQuery(toolQueryOptions({ slug: params.slug }));
    context.queryClient.prefetchInfiniteQuery(
      toolCommentsQueryOptions({ slug: params.slug }),
    );
  },
});

function RouteComponent() {
  return (
    <main className="flex flex-1 p-4 sm:px-8 md:px-16">
      <Suspense fallback={<ToolSkeleton />}>
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              FallbackComponent={({ resetErrorBoundary }) => (
                <ErrorFallback
                  description="Something unexpected happened, so we couldn't load the tool. Click the button below to try again."
                  onRetry={resetErrorBoundary}
                />
              )}
              onReset={reset}
            >
              <Tool />
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </Suspense>
    </main>
  );
}
