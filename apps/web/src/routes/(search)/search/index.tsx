import {
  dehydrate,
  HydrationBoundary,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { searchQueryStringSchema } from "@workspace/shared/schemas/search";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./-components/error-fallback";
import Header from "./-components/header";
import LoadingSkeleton from "./-components/loading-skeleton";
import Tools from "./-components/tools";
import { searchQueryOptions } from "./-queries/search";

const searchParamsValidator = zodValidator(searchQueryStringSchema);

export const Route = createFileRoute("/(search)/search/")({
  validateSearch: searchParamsValidator,
  beforeLoad: async ({ search, context }) => {
    if (!search.query) {
      throw redirect({ to: "/", replace: true });
    }

    await context.queryClient.prefetchInfiniteQuery(searchQueryOptions(search));
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Header />
      <Suspense fallback={<LoadingSkeleton />}>
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary onReset={reset} FallbackComponent={ErrorFallback}>
              <Tools />
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </Suspense>
    </HydrationBoundary>
  );
}
