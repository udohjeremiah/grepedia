import {
  dehydrate,
  HydrationBoundary,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from "@/components/error-fallback";

import DangerZone from "./-components/danger-zone";
import UserData from "./-components/user-data";
import UserDataSkeleton from "./-components/user-data-skeleton";
import { userRecoveryPackageQueryOptions } from "./-queries/user-recovery-package";

export const Route = createFileRoute("/_authenticated/@{$username}/data/")({
  beforeLoad: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      userRecoveryPackageQueryOptions({ userId: context.userId }),
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="flex p-4 sm:px-8 md:px-0 md:py-6">
        <div className="flex flex-col gap-6">
          <Suspense fallback={<UserDataSkeleton />}>
            <QueryErrorResetBoundary>
              {({ reset }) => (
                <ErrorBoundary
                  FallbackComponent={({ resetErrorBoundary }) => (
                    <ErrorFallback
                      description="Something unexpected happened, so we couldn't load your recovery package. Click the button below to try again."
                      onRetry={resetErrorBoundary}
                    />
                  )}
                  onReset={reset}
                >
                  <UserData />
                </ErrorBoundary>
              )}
            </QueryErrorResetBoundary>
          </Suspense>
          <DangerZone />
        </div>
      </main>
    </HydrationBoundary>
  );
}
