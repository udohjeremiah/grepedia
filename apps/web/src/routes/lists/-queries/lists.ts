import type { GetListsQueryString } from "@workspace/shared/schemas/lists/get-lists";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { getLists } from "@/services/lists/get-lists";

export const listsQueryOptions = (queryString: GetListsQueryString = {}) =>
  queryOptions({
    queryFn: () => getLists(queryString),
    queryKey: ["lists", queryString],
  });

export const useLists = (queryString: GetListsQueryString = {}) => {
  return useSuspenseQuery({
    ...listsQueryOptions(queryString),
    select: (data) => data.data.lists,
  });
};
