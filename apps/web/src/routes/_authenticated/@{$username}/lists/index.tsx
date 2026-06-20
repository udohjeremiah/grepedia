import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { ErrorFallback } from "@/components/error-fallback";
import { listsQueryOptions } from "@/routes/lists/-queries/lists";

import { UserLists } from "./-components/user-lists";

export const Route = createFileRoute("/_authenticated/@{$username}/lists/")({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.prefetchInfiniteQuery(
      listsQueryOptions({ createdBy: context.userId }),
    );
  },
  // eslint-disable-next-line perfectionist/sort-objects
  head: ({ params }) => ({
    meta: [
      { title: "Lists • Grepedia" },
      {
        content: `Manage curated lists created by @${params.username} on Grepedia.`,
        name: "description",
      },
    ],
  }),
});

function RouteComponent() {
  return (
    <main className="flex p-4 sm:px-8 md:px-0 md:py-6">
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            FallbackComponent={({ resetErrorBoundary }) => (
              <ErrorFallback
                description="Something unexpected happened, so we couldn't load your lists. Click the button below to try again."
                onRetry={resetErrorBoundary}
              />
            )}
            onReset={reset}
          >
            <Suspense>
              <UserLists />
            </Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </main>
  );
}
