import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import AppLink from "@/components/app-link";
import ErrorFallback from "@/components/error-fallback";
import { auth } from "@/hooks/auth";

import SearchForm from "./-components/search-form";
import ToolsStats from "./-components/tools-stats";
import { toolsStatsQueryOptions } from "./-queries/tools-stats";

export const Route = createFileRoute("/_root/")({
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: "Grepedia • Search Tools Worldwide" },
      {
        content:
          "Search Grepedia to discover tools from around the world, curated and reviewed by the community.",
        name: "description",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(toolsStatsQueryOptions());
  },
});

function RouteComponent() {
  const { user } = auth.useSession();

  return (
    <div className="flex min-h-svh flex-col">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 p-4 md:p-6">
        <div className="flex flex-col items-center justify-center gap-2">
          <img alt="Grepedia" height={64} src="/favicon.svg" width={64} />
          <h1 className="text-2xl font-bold">Grepedia</h1>
        </div>
        <SearchForm className="w-full" />
      </main>
      <footer className="mx-auto flex flex-col items-center gap-2 p-4 md:p-6">
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              FallbackComponent={({ resetErrorBoundary }) => (
                <ErrorFallback
                  description="Couldn't load tools stats."
                  onRetry={resetErrorBoundary}
                  variant="compact"
                />
              )}
              onReset={reset}
            >
              <Suspense>
                <ToolsStats />
              </Suspense>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
        <Separator />
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <AppLink className="text-xs" to="/tools/directory">
              All Tools
            </AppLink>
            <span className="text-muted-foreground">•</span>
            {user ? (
              <AppLink
                className="text-xs"
                params={{ username: user.username }}
                to="/@{$username}"
              >
                Account
              </AppLink>
            ) : (
              <AppLink className="text-xs" to="/signin">
                Sign In
              </AppLink>
            )}
          </div>
          <Button asChild className="size-fit p-0" variant="link">
            <a href="https://www.netlify.com" rel="noreferrer" target="_blank">
              This site is powered by Netlify
            </a>
          </Button>
        </div>
      </footer>
    </div>
  );
}
