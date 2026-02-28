import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from "@/components/error-fallback";

import User from "./-components/user";

export const Route = createFileRoute("/_authenticated/@{$username}/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="flex p-4 sm:px-8 md:px-0 md:py-6">
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            FallbackComponent={({ resetErrorBoundary }) => (
              <ErrorFallback
                description="Something unexpected happened, so we couldn't load your profile. Click the button below to try again."
                onRetry={resetErrorBoundary}
              />
            )}
            onReset={reset}
          >
            <User />
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </main>
  );
}
