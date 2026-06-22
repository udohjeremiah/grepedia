import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ErrorBoundary } from "react-error-boundary";

import { ErrorFallback } from "@/components/error-fallback";

import { ToolDescription } from "./-components/tool-description";

export const Route = createFileRoute("/tools/@{$slug}/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          FallbackComponent={({ resetErrorBoundary }) => (
            <ErrorFallback
              description="Something unexpected happened, so we couldn't load this tool page. Click the button below to try again."
              onRetry={resetErrorBoundary}
            />
          )}
          onReset={reset}
        >
          <ToolDescription />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
