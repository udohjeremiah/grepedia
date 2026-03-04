import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { FolderOpenIcon, TrophyIcon } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from "@/components/error-fallback";

import Directory from "./-components/directory";
import DirectorySkeleton from "./-components/directory-skeleton";
import { toolsDirectoryCategoriesQueryOptions } from "./-queries/tools-directory-categories";

export const Route = createFileRoute("/_authenticated/tools/directory/")({
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: "Tools Directory — Grepedia" },
      {
        content:
          "Browse the full Grepedia tools directory and discover tools from around the world.",
        name: "description",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(toolsDirectoryCategoriesQueryOptions());
  },
});

function RouteComponent() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 sm:px-8 md:px-16">
      <div className="flex justify-between gap-4 rounded-lg border p-4 sm:p-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
          <FolderOpenIcon className="size-5" />
        </div>
        <div className="flex w-full justify-between gap-4 max-sm:flex-col">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">All Tools Directory</h2>
            <p className="text-sm text-muted-foreground">
              Browse tools grouped by category. Each section supports
              independent pagination.
            </p>
          </div>
          <Button asChild className="text-warning" variant="outline">
            <Link to="/leaderboard">
              <TrophyIcon /> View Leaderboard
            </Link>
          </Button>
        </div>
      </div>
      <Suspense fallback={<DirectorySkeleton />}>
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              FallbackComponent={({ resetErrorBoundary }) => (
                <ErrorFallback
                  description="Something unexpected happened, so we couldn't load the directory. Click the button below to try again."
                  onRetry={resetErrorBoundary}
                />
              )}
              onReset={reset}
            >
              <Directory />
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </Suspense>
    </main>
  );
}
