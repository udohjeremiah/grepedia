import {
  dehydrate,
  HydrationBoundary,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { z } from "zod";

import UserTools from "./-components/user-tools";
import UserToolsErrorFallback from "./-components/user-tools-error-fallback";
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
                FallbackComponent={UserToolsErrorFallback}
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
