import type { SearchQueryString } from "@workspace/shared/schemas/search";

import {
  infiniteQueryOptions,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { omitKeys } from "@workspace/shared/omit-keys";

import { search } from "@/services/search";

export const searchQueryOptions = (params: SearchQueryString) => {
  const normalizedParams = omitKeys(params, ["cursor", "limit"]);

  return infiniteQueryOptions({
    initialPageParam: "",
    queryFn: ({ pageParam }) =>
      search({ ...normalizedParams, cursor: pageParam, limit: params.limit }),
    queryKey: ["tools", normalizedParams],
    // eslint-disable-next-line perfectionist/sort-objects
    getNextPageParam: (lastPage) => lastPage.data.nextCursor,
  });
};

export const useSearchTools = (params: SearchQueryString) => {
  return useSuspenseInfiniteQuery({
    ...searchQueryOptions(params),
    select: (data) => data.pages.flatMap((page) => page.data.tools),
  });
};
