import {
  type DefaultOptions,
  defaultShouldDehydrateQuery,
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";

import { globalBanner } from "@/utils/global-banner";

export function tanstackQueryClient() {
  const queryBannerIds = new Map<string, string>();

  const defaultOptions: DefaultOptions = {
    dehydrate: {
      shouldDehydrateQuery: (query) => {
        // Include pending queries in dehydration, so the client can avoid
        // initiating duplicate fetches for the same data. If the server has
        // already started fetching data for a query, the client can use the
        // pending state instead of triggering another fetch.
        const shouldDehydrate =
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending";

        return shouldDehydrate;
      },
    },
    queries: {
      // With SSR, we usually want to set some default staleTime
      // above 0 to avoid refetching immediately on the client
      staleTime: 5 * 60 * 1000,
    },
  };

  const queryCache = new QueryCache({
    onError: (_error, query) => {
      // Show a global banner if we already have data in the cache which
      // indicates a failed background update
      if (query.state.data !== undefined) {
        const existingBannerId = queryBannerIds.get(query.queryHash);
        if (existingBannerId) return;

        const bannerId = globalBanner.emit({
          banner: {
            autoDismiss: false,
            description:
              "We couldn't fetch the latest update for this section. The data currently shown is the last successfully loaded version and may be out of date.",
            title: "Showing previously loaded data",
            variant: "warning",
          },
          type: "add",
        });

        if (bannerId) {
          queryBannerIds.set(query.queryHash, bannerId);
        }
      }
    },
    onSuccess: (_data, query) => {
      // Remove any previous associated global banner when data is successfully fetched
      const bannerId = queryBannerIds.get(query.queryHash);

      if (bannerId) {
        globalBanner.emit({ id: bannerId, type: "remove" });
        queryBannerIds.delete(query.queryHash);
      }
    },
  });

  const mutationCache = new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      // Automatic query invalidation after mutations:
      // - A mutation with a `mutationKey` would invalidate everything related to that key only.
      // - A mutation without a `mutationKey` would invalidate everything in the cache.
      // The invalidation isn't awaited or returned because we want the
      // mutations to finish as fast as possible.
      queryClient.invalidateQueries({ queryKey: mutation.options.mutationKey });
    },
  });

  const queryClient = new QueryClient({
    defaultOptions,
    mutationCache,
    queryCache,
  });

  return queryClient;
}
