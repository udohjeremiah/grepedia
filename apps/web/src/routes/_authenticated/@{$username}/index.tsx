import {
  dehydrate,
  HydrationBoundary,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import User from "./-components/user";
import UserErrorFallback from "./-components/user-error-fallback";
import UserSkeleton from "./-components/user-skeleton";
import { userQueryOptions } from "./-queries/user";

export const Route = createFileRoute("/_authenticated/@{$username}/")({
  beforeLoad: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      userQueryOptions({ userId: context.userId }),
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="flex p-4 sm:px-8 md:px-0 md:py-6">
        <Suspense fallback={<UserSkeleton />}>
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary
                FallbackComponent={UserErrorFallback}
                onReset={reset}
              >
                <User />
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </Suspense>
      </main>
    </HydrationBoundary>
  );
}
