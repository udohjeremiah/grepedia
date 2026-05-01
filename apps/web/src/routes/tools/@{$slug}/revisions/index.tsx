import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from "@/components/error-fallback";

import ToolProposals from "./-components/tool-proposals";
import ToolRevisions from "./-components/tool-revisions";
import { toolProposalsQueryOptions } from "./-queries/tool-proposals";
import { toolRevisionsQueryOptions } from "./-queries/tool-revisions";

export const Route = createFileRoute("/tools/@{$slug}/revisions/")({
  component: RouteComponent,
  loader: ({ context, params }) => {
    context.queryClient.prefetchInfiniteQuery(
      toolRevisionsQueryOptions({ slug: params.slug }),
    );
    context.queryClient.prefetchQuery(
      toolProposalsQueryOptions({ slug: params.slug }),
    );
  },
  // eslint-disable-next-line perfectionist/sort-objects
  head: ({ params }) => ({
    meta: [
      { title: "Revisions • Grepedia" },
      {
        content: `Review proposals and revision history for ${params.slug} on Grepedia.`,
        name: "description",
      },
    ],
  }),
});

function RouteComponent() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          FallbackComponent={({ resetErrorBoundary }) => (
            <ErrorFallback
              description="Something unexpected happened, so we couldn't load revisions for this tool. Click the button below to try again."
              onRetry={resetErrorBoundary}
            />
          )}
          onReset={reset}
        >
          <Suspense>
            <ToolProposals />
            <ToolRevisions />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
