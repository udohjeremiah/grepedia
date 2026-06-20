import type {
  GetUserBookmarksParams,
  GetUserBookmarksQueryString,
} from "@workspace/shared/schemas/users/bookmarks/get-user-bookmarks";

import {
  infiniteQueryOptions,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";

import { userQueryOptions } from "@/routes/_authenticated/@{$username}/-queries/user";
import { getUserBookmarks } from "@/services/users/get-user-bookmarks";

export const userBookmarksQueryOptions = (
  params: GetUserBookmarksParams,
  queryString: GetUserBookmarksQueryString = {},
) => {
  return infiniteQueryOptions({
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      getUserBookmarks({
        params,
        queryString: { ...queryString, cursor: pageParam },
      }),
    queryKey: [...userQueryOptions(params.userId).queryKey, "bookmarks"],
    // eslint-disable-next-line perfectionist/sort-objects
    getNextPageParam: (lastPage) => lastPage.data.nextCursor,
  });
};

export const useUserBookmarks = (
  params: GetUserBookmarksParams,
  queryString: GetUserBookmarksQueryString = {},
) => {
  return useSuspenseInfiniteQuery({
    ...userBookmarksQueryOptions(params, queryString),
    select: (data) => data.pages.flatMap((page) => page.data.bookmarks),
  });
};
