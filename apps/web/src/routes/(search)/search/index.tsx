import {
  dehydrate,
  HydrationBoundary,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { searchQueryStringSchema } from "@workspace/shared/schemas/search";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from "@/components/error-fallback";

import Header from "./-components/header";
import Tools from "./-components/tools";
import ToolsSkeleton from "./-components/tools-skeleton";
import { searchQueryOptions } from "./-queries/search";

export const Route = createFileRoute("/(search)/search/")({
  beforeLoad: async ({ context, search }) => {
    if (!search.query) throw redirect({ replace: true, to: "/" });

    await context.queryClient.prefetchInfiniteQuery(searchQueryOptions(search));
  },
  component: RouteComponent,
  validateSearch: searchQueryStringSchema,
});

function RouteComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Header />
      <Suspense fallback={<ToolsSkeleton />}>
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              FallbackComponent={({ resetErrorBoundary }) => (
                <div className="flex flex-1 p-4 sm:p-8 md:px-16">
                  <ErrorFallback
                    description="Something unexpected happened, so we couldn't load your search results. Click the button below to try again."
                    onRetry={resetErrorBoundary}
                  />
                </div>
              )}
              onReset={reset}
            >
              <Tools />
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </Suspense>
    </HydrationBoundary>
  );
}
