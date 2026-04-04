import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Separator } from "@workspace/ui/components/separator";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import AppLink from "@/components/app-link";
import ErrorFallback from "@/components/error-fallback";
import { auth } from "@/hooks/auth";

import SearchForm from "./-components/search-form";
import ToolsCount from "./-components/tools-count";
import ToolsCountSkeleton from "./-components/tools-count-skeleton";
import { toolsCountQueryOptions } from "./-queries/tools-count";

export const Route = createFileRoute("/(search)/")({
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
    context.queryClient.prefetchQuery(toolsCountQueryOptions());
  },
});

function RouteComponent() {
  const { user } = auth.useSession();

  return (
    <>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 p-4 md:p-6">
        <div className="flex flex-col items-center justify-center gap-2">
          <img alt="Grepedia" height={64} src="/favicon.svg" width={64} />
          <h1 className="text-2xl font-bold">Grepedia</h1>
        </div>
        <SearchForm className="w-full" />
      </main>
      <footer className="mx-auto flex items-center gap-6 p-4 md:p-6">
        <Suspense fallback={<ToolsCountSkeleton />}>
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary
                FallbackComponent={({ resetErrorBoundary }) => (
                  <ErrorFallback
                    description="Couldn't load tools count."
                    onRetry={resetErrorBoundary}
                    variant="compact"
                  />
                )}
                onReset={reset}
              >
                <ToolsCount />
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </Suspense>
        <Separator orientation="vertical" />
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
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
          <div className="flex flex-wrap items-center gap-2">
            <AppLink className="text-xs" to="/terms-of-service">
              Terms of Service
            </AppLink>
            <span className="text-muted-foreground">•</span>
            <AppLink className="text-xs" to="/privacy-policy">
              Privacy Policy
            </AppLink>
          </div>
        </div>
      </footer>
    </>
  );
}
