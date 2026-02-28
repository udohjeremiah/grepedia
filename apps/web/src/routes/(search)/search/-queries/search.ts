import type { SearchQueryString } from "@workspace/shared/schemas/search";

import {
  infiniteQueryOptions,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { omitKeys } from "@workspace/shared/omit-keys";

import { search } from "@/services/search";

export const searchQueryOptions = (params: SearchQueryString) => {
  return infiniteQueryOptions({
    initialPageParam: "",
    queryFn: ({ pageParam }) => search({ ...params, cursor: pageParam }),
    queryKey: ["tools", "search", omitKeys(params, ["cursor", "limit"])],
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
