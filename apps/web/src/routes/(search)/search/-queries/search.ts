import { search } from "@/services/search";
import {
  infiniteQueryOptions,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { omitKeys } from "@workspace/shared/omit-keys";
import type { SearchQueryString } from "@workspace/shared/schemas/search";

export const searchQueryOptions = (params: SearchQueryString) => {
  const normalizedParams = omitKeys(params, ["cursor"]);

  return infiniteQueryOptions({
    queryKey: ["tools", normalizedParams],
    queryFn: ({ pageParam }) =>
      search({ ...normalizedParams, cursor: pageParam }),
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.data.nextCursor,
  });
};

export const useSearchTools = (params: SearchQueryString) => {
  return useSuspenseInfiniteQuery({
    ...searchQueryOptions(params),
    select: (data) => data.pages.flatMap((page) => page.data.tools),
  });
};
