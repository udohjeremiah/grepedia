import type { GetListsQueryString } from "@workspace/shared/schemas/lists/get-lists";

import {
  infiniteQueryOptions,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";

import { getLists } from "@/services/lists/get-lists";

export const listsQueryOptions = (queryString: GetListsQueryString = {}) =>
  infiniteQueryOptions({
    initialPageParam: "",
    queryFn: ({ pageParam }) => getLists({ ...queryString, cursor: pageParam }),
    queryKey: ["lists", queryString],
    // eslint-disable-next-line perfectionist/sort-objects
    getNextPageParam: (lastPage) => lastPage.data.nextCursor,
  });

export const useLists = (queryString: GetListsQueryString = {}) => {
  return useSuspenseInfiniteQuery({
    ...listsQueryOptions(queryString),
    select: (data) => data.pages.flatMap((page) => page.data.lists),
  });
};
