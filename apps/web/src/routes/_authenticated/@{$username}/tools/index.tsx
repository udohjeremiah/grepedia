import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { z } from "zod";

import ErrorFallback from "@/components/error-fallback";

import UserTools from "./-components/user-tools";
import UserToolsSkeleton from "./-components/user-tools-skeleton";
import { userToolsQueryOptions } from "./-queries/user-tools";

export const Route = createFileRoute("/_authenticated/@{$username}/tools/")({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(
      userToolsQueryOptions({ userId: context.userId }),
    );
  },
  // eslint-disable-next-line perfectionist/sort-objects
  head: ({ params }) => ({
    meta: [
      { title: `@${params.username} — Tools | Grepedia` },
      {
        content: `Browse tools associated with @${params.username}, including owned, added, and updated tools.`,
        name: "description",
      },
    ],
  }),
  validateSearch: z.object({
    modal: z.literal("add-tool").optional(),
  }),
});

function RouteComponent() {
  return (
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
  );
}
