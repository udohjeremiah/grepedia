import {
  dehydrate,
  HydrationBoundary,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from "@/components/error-fallback";

import Nav from "./-components/nav";
import NavSkeleton from "./-components/nav-skeleton";
import { userStatQueryOptions } from "./-queries/user-stats";

export const Route = createFileRoute("/_authenticated/@{$username}")({
  beforeLoad: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      userStatQueryOptions({ userId: context.userId }),
    );
  },
  component: LayoutComponent,
});

function LayoutComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-1">
        <div className="grid flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] md:grid-cols-[25%_minmax(0,1fr)] md:grid-rows-none md:gap-6 md:px-16 lg:gap-8 lg:px-32">
          <Suspense fallback={<NavSkeleton />}>
            <QueryErrorResetBoundary>
              {({ reset }) => (
                <ErrorBoundary
                  FallbackComponent={({ resetErrorBoundary }) => (
                    <div className="p-4 sm:px-8 md:px-0 md:py-6">
                      <ErrorFallback
                        description="Something unexpected happened, so we couldn't load the navigation. Click the button below to try again."
                        onRetry={resetErrorBoundary}
                      />
                    </div>
                  )}
                  onReset={reset}
                >
                  <Nav />
                </ErrorBoundary>
              )}
            </QueryErrorResetBoundary>
          </Suspense>
          <Outlet />
        </div>
      </div>
    </HydrationBoundary>
  );
}
