import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Separator } from "@workspace/ui/components/separator";
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from "@/components/error-fallback";

import ActiveSessions from "./-components/active-sessions";
import RevokeOtherSessionsDialog from "./-components/revoke-other-sessions-dialog";

export const Route = createFileRoute("/_authenticated/@{$username}/sessions/")({
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
                description="Something unexpected happened, so we couldn't load your sessions. Click the button below to try again."
                onRetry={resetErrorBoundary}
              />
            )}
            onReset={reset}
          >
            <div className="flex flex-1 flex-col gap-6 rounded-lg border p-6">
              <div className="flex w-full justify-between gap-4 max-sm:flex-col">
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold">Active Sessions</h3>
                  <p className="text-sm text-muted-foreground">
                    Devices currently signed into your account.
                  </p>
                </div>
                <RevokeOtherSessionsDialog />
              </div>
              <Separator />
              <ActiveSessions />
            </div>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </main>
  );
}
