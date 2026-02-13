import {
  dehydrate,
  HydrationBoundary,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import UserDetails from "./-components/user-details";
import UserDetailsErrorFallback from "./-components/user-details-error-fallback";
import UserDetailsSkeleton from "./-components/user-details-skeleton";
import { userDetailsQueryOptions } from "./-queries/user-details";

export const Route = createFileRoute("/_authenticated/@{$username}/")({
  beforeLoad: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      userDetailsQueryOptions({ id: context.userId }),
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="flex p-4 sm:px-8 md:px-0 md:py-6">
        <Suspense fallback={<UserDetailsSkeleton />}>
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary
                FallbackComponent={UserDetailsErrorFallback}
                onReset={reset}
              >
                <UserDetails />
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </Suspense>
      </main>
    </HydrationBoundary>
  );
}
