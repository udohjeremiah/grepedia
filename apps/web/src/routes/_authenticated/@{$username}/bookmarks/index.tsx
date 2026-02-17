import {
  dehydrate,
  HydrationBoundary,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import UserBookmarks from "./-components/user-bookmarks";
import UserBookmarksErrorFallback from "./-components/user-bookmarks-error-fallback";
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
                FallbackComponent={UserBookmarksErrorFallback}
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
