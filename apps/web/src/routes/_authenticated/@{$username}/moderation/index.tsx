import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Separator } from "@workspace/ui/components/separator";
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from "@/components/error-fallback";
import { getSession } from "@/utils/get-session";

import Moderation from "./-components/moderation";

export const Route = createFileRoute(
  "/_authenticated/@{$username}/moderation/",
)({
  beforeLoad: async () => {
    const session = await getSession();
    const role = session?.user.role;

    if (!role || role !== "moderator") throw notFound();
  },
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: "Moderation • Grepedia" },
      {
        content:
          "Manage role progression, moderation queue, and flagged activity on Grepedia.",
        name: "description",
      },
    ],
  }),
});

function RouteComponent() {
  return (
    <main className="flex p-4 sm:px-8 md:px-0 md:py-6">
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            FallbackComponent={({ resetErrorBoundary }) => (
              <ErrorFallback
                description="Something unexpected happened, so we couldn't load moderation. Click the button below to try again."
                onRetry={resetErrorBoundary}
              />
            )}
            onReset={reset}
          >
            <div className="flex flex-1 flex-col gap-6 rounded-lg border p-6">
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold">Moderation</h3>
                <p className="text-sm text-muted-foreground">
                  Appeals and moderation requests start on Discord. Moderators
                  can review and resolve cases here by searching for a username.
                </p>
              </div>
              <Separator />
              <Moderation />
            </div>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </main>
  );
}
