import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { searchQueryStringSchema } from "@workspace/shared/schemas/search/search";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { AppLayout } from "@/components/app-layout";
import { ErrorFallback } from "@/components/error-fallback";

import { Search } from "./-components/search";
import { Tabs } from "./-components/tabs";
import { Tools } from "./-components/tools";
import { searchQueryOptions } from "./-queries/search";

export const Route = createFileRoute("/search/")({
  beforeLoad: ({ search }) => {
    if (!search.query) throw redirect({ replace: true, to: "/" });
  },
  component: RouteComponent,
  loaderDeps: ({ search }) => ({ query: search.query, tab: search.tab }),
  // eslint-disable-next-line perfectionist/sort-objects
  loader: ({ context, deps }) => {
    context.queryClient.prefetchInfiniteQuery(searchQueryOptions(deps));

    return deps;
  },
  // eslint-disable-next-line perfectionist/sort-objects
  head: ({ loaderData }) => {
    const query = loaderData?.query;

    return {
      meta: [
        { title: `${query ?? "Search"} • Search Results • Grepedia` },
        {
          content: query
            ? `Search results for "${query}" on Grepedia.`
            : "Search tools and resources on Grepedia.",
          name: "description",
        },
      ],
    };
  },
  validateSearch: searchQueryStringSchema,
});

function RouteComponent() {
  return (
    <AppLayout header={{ search: <Search />, tabs: <Tabs /> }}>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            FallbackComponent={({ resetErrorBoundary }) => (
              <div className="flex flex-1 p-4 sm:p-8 md:px-16">
                <ErrorFallback
                  description="Something unexpected happened, so we couldn't load your search results. Click the button below to try again."
                  onRetry={resetErrorBoundary}
                />
              </div>
            )}
            onReset={reset}
          >
            <Suspense>
              <Tools />
            </Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </AppLayout>
  );
}
