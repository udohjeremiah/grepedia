import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from "@/components/error-fallback";

import UserBookmarks from "./-components/user-bookmarks";
import UserBookmarksSkeleton from "./-components/user-bookmarks-skeleton";
import { userBookmarksQueryOptions } from "./-queries/user-bookmarks";

export const Route = createFileRoute("/_authenticated/@{$username}/bookmarks/")(
  {
    component: RouteComponent,
    loader: ({ context }) => {
      context.queryClient.prefetchQuery(
        userBookmarksQueryOptions({ userId: context.userId }),
      );
    },
    // eslint-disable-next-line perfectionist/sort-objects
    head: ({ params }) => ({
      meta: [
        { title: `@${params.username} • Bookmarks • Grepedia` },
        {
          content: `View bookmarked tools saved by @${params.username} on Grepedia.`,
          name: "description",
        },
      ],
    }),
  },
);

function RouteComponent() {
  return (
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
  );
}
