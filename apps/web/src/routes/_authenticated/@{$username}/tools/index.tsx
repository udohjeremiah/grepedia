import {
  dehydrate,
  HydrationBoundary,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { z } from "zod";

import ErrorFallback from "@/components/error-fallback";

import UserTools from "./-components/user-tools";
import UserToolsSkeleton from "./-components/user-tools-skeleton";
import { userToolsQueryOptions } from "./-queries/user-tools";

export const Route = createFileRoute("/_authenticated/@{$username}/tools/")({
  beforeLoad: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      userToolsQueryOptions({ userId: context.userId }),
    );
  },
  component: RouteComponent,
  validateSearch: z.object({
    modal: z.literal("add-tool").optional(),
  }),
});

function RouteComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="flex p-4 sm:px-8 md:px-0 md:py-6">
        <Suspense fallback={<UserToolsSkeleton />}>
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary
                FallbackComponent={({ resetErrorBoundary }) => (
                  <ErrorFallback
                    description="Something unexpected happened, so we couldn't load your tools. Click the button below to try again."
                    onRetry={resetErrorBoundary}
                  />
                )}
                onReset={reset}
              >
                <UserTools />
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </Suspense>
      </main>
    </HydrationBoundary>
  );
}
