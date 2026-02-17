import type { GetUserBookmarksParams } from "@workspace/shared/schemas/users/get-user-bookmarks";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { getUserBookmarks } from "@/services/users/get-user-bookmarks";

export const userBookmarksQueryOptions = (params: GetUserBookmarksParams) => {
  return queryOptions({
    queryFn: () => getUserBookmarks(params),
    queryKey: ["user", params.userId, "bookmarks"],
  });
};

export const useUserBookmarks = (params: GetUserBookmarksParams) =>
  useSuspenseQuery({
    ...userBookmarksQueryOptions(params),
    select: (data) => data.data.bookmarks,
  });
