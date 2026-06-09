import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ErrorBoundary } from "react-error-boundary";

import { ErrorFallback } from "@/components/error-fallback";

export const Route = createFileRoute("/lists/$slug")({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <main className="flex flex-1 p-4 sm:px-8 md:px-16">
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            FallbackComponent={({ resetErrorBoundary }) => (
              <ErrorFallback
                description="Something unexpected happened, so we couldn't load this list. Click the button below to try again."
                onRetry={resetErrorBoundary}
              />
            )}
            onReset={reset}
          >
            <Outlet />
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </main>
  );
}
