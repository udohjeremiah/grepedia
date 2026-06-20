import type {
  GetListParams,
  GetListQueryString,
} from "@workspace/shared/schemas/lists/get-list";

import {
  infiniteQueryOptions,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";

import { getList } from "@/services/lists/get-list";

import { listsQueryOptions } from "../../-queries/lists";

export const listQueryOptions = (
  params: GetListParams,
  queryString: GetListQueryString = {},
) => {
  return infiniteQueryOptions({
    initialPageParam: "",
    queryFn: ({ pageParam }) =>
      getList({ params, queryString: { ...queryString, cursor: pageParam } }),
    queryKey: [...listsQueryOptions(queryString).queryKey, params.slug],
    // eslint-disable-next-line perfectionist/sort-objects
    getNextPageParam: (lastPage) => lastPage.data.nextCursor,
  });
};

export const useList = (
  params: GetListParams,
  queryString: GetListQueryString = {},
) => {
  return useSuspenseInfiniteQuery({
    ...listQueryOptions(params, queryString),
    select: (data) => ({
      list: data.pages[0]!.data.list,
      tools: data.pages.flatMap((page) => page.data.tools),
    }),
  });
};
