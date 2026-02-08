import AppLink from "@/components/app-link";
import { auth } from "@/hooks/auth";
import {
  dehydrate,
  HydrationBoundary,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import SearchForm from "./-components/search-form";
import ToolsCount from "./-components/tools-count";
import { toolsCountQueryOptions } from "./-queries/tools-count";

export const Route = createFileRoute("/(search)/")({
  beforeLoad: async ({ context }) => {
    await context.queryClient.prefetchQuery(toolsCountQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { queryClient } = Route.useRouteContext();
  const { data: sessionData } = auth.useSession();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 p-4 md:p-6">
        <div className="flex flex-col items-center justify-center gap-2">
          <img src="/favicon.svg" alt="Grepedia" width={64} height={64} />
          <h1 className="text-2xl font-bold">Grepedia</h1>
        </div>
        <SearchForm className="w-full" />
      </main>
      <footer className="flex flex-col items-center p-4 md:p-6">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center gap-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-56" />
            </div>
          }
        >
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary
                onReset={reset}
                FallbackComponent={() => (
                  <div className="flex flex-col items-center">
                    <p className="text-sm/relaxed">
                      Couldn&apos;t display result.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={reset}
                      className="w-full"
                    >
                      Try again
                    </Button>
                  </div>
                )}
              >
                <ToolsCount />
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </Suspense>
        <div className="flex flex-wrap items-center justify-center gap-1">
          {sessionData ? (
            <AppLink
              to="/@{$username}"
              params={{ username: sessionData?.user.username }}
              className="text-xs"
            >
              Your Profile
            </AppLink>
          ) : (
            <AppLink to="/signin" className="text-xs">
              Sign in
            </AppLink>
          )}
          <span className="text-xs text-muted-foreground">•</span>
          <AppLink to="/terms-of-service" className="text-xs">
            Terms of Service
          </AppLink>
          <span className="text-xs text-muted-foreground">•</span>
          <AppLink to="/privacy-policy" className="text-xs">
            Privacy Policy
          </AppLink>
        </div>
      </footer>
    </HydrationBoundary>
  );
}
