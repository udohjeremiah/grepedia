import {
  dehydrate,
  HydrationBoundary,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { searchQueryStringSchema } from "@workspace/shared/schemas/search";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import Header from "./-components/header";
import Tools from "./-components/tools";
import ToolsErrorFallback from "./-components/tools-error-fallback";
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
              FallbackComponent={ToolsErrorFallback}
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
