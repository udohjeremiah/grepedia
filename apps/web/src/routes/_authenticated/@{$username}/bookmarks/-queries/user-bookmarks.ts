import type { GetUserBookmarksParams } from "@workspace/shared/schemas/users/get-user-bookmarks";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { userQueryOptions } from "@/routes/_authenticated/@{$username}/-queries/user";
import { getUserBookmarks } from "@/services/users/get-user-bookmarks";

export const userBookmarksQueryOptions = (params: GetUserBookmarksParams) => {
  return queryOptions({
    queryFn: () => getUserBookmarks(params),
    queryKey: [...userQueryOptions(params.userId).queryKey, "bookmarks"],
  });
};

export const useUserBookmarks = (params: GetUserBookmarksParams) => {
  return useSuspenseQuery({
    ...userBookmarksQueryOptions(params),
    select: (data) => data.data.bookmarks,
  });
};
