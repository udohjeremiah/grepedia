import {
  dehydrate,
  HydrationBoundary,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from "@/components/error-fallback";

import UserBookmarks from "./-components/user-bookmarks";
import UserBookmarksSkeleton from "./-components/user-bookmarks-skeleton";
import { userBookmarksQueryOptions } from "./-queries/user-bookmarks";

export const Route = createFileRoute("/_authenticated/@{$username}/bookmarks/")(
  {
    beforeLoad: async ({ context }) => {
      await context.queryClient.prefetchQuery(
        userBookmarksQueryOptions({ userId: context.userId }),
      );
    },
    component: RouteComponent,
  },
);

function RouteComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="flex p-4 sm:px-8 md:px-0 md:py-6">
        <Suspense fallback={<UserBookmarksSkeleton />}>
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary
                FallbackComponent={({ resetErrorBoundary }) => (
                  <ErrorFallback
                    description="Something unexpected happened, so we couldn't load your bookmarks. Click the button below to try again."
                    onRetry={resetErrorBoundary}
                  />
                )}
                onReset={reset}
              >
                <UserBookmarks />
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </Suspense>
      </main>
    </HydrationBoundary>
  );
}
