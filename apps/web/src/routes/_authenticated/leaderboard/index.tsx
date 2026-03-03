import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { TrophyIcon } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from "@/components/error-fallback";

import Leaderboard from "./-components/leaderboard";
import LeaderboardSkeleton from "./-components/leaderboard-skeleton";
import { usersLeaderboardQueryOptions } from "./-queries/users-leaderboard";

export const Route = createFileRoute("/_authenticated/leaderboard/")({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.prefetchInfiniteQuery(usersLeaderboardQueryOptions({}));
  },
});

function RouteComponent() {
  return (
    <main className="mx-auto flex max-w-5xl flex-1 p-4 sm:px-8 md:px-16">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <TrophyIcon className="size-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Leaderboard</h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Top contributors ranked by their impact on the platform.
          </p>
        </div>
        <Suspense fallback={<LeaderboardSkeleton />}>
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary
                FallbackComponent={({ resetErrorBoundary }) => (
                  <ErrorFallback
                    description="Something unexpected happened, so we couldn't load the leaderboard. Click the button below to try again."
                    onRetry={resetErrorBoundary}
                  />
                )}
                onReset={reset}
              >
                <Leaderboard />
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </Suspense>
        <div className="rounded-lg border px-4 py-3">
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            Rankings are based on all-time contributions. Only users with at
            least one contribution are listed. Refresh periodically to see the
            latest updates.
          </p>
        </div>
      </div>
    </main>
  );
}
