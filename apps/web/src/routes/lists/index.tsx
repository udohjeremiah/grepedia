import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { PlusIcon } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { ErrorFallback } from "@/components/error-fallback";

import { Lists } from "./-components/lists";
import { listsQueryOptions } from "./-queries/lists";

export const Route = createFileRoute("/lists/")({
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: "Lists • Grepedia" },
      {
        content:
          "Explore featured and curated lists of tools created by the Grepedia community.",
        name: "description",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(listsQueryOptions());
  },
});

function RouteComponent() {
  return (
    <main className="mx-auto flex max-w-6xl flex-1 p-4 sm:px-8 md:px-16">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight">Lists</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Explore featured and curated lists of tools created by the
              community.
            </p>
          </div>
          <Button asChild>
            <Link to="/lists/new">
              <PlusIcon />
              Create List
            </Link>
          </Button>
        </div>
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              FallbackComponent={({ resetErrorBoundary }) => (
                <ErrorFallback
                  description="Something unexpected happened, so we couldn't load the lists. Click the button below to try again."
                  onRetry={resetErrorBoundary}
                />
              )}
              onReset={reset}
            >
              <Suspense>
                <Lists />
              </Suspense>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </div>
    </main>
  );
}
