import { useMutation } from "@tanstack/react-query";

import { removeUserBookmark } from "@/services/users/remove-user-bookmark";

import { userBookmarksQueryOptions } from "./user-bookmarks";

export const useUserRemoveBookmark = (userId: string) => {
  return useMutation({
    mutationFn: removeUserBookmark,
    mutationKey: userBookmarksQueryOptions({ userId }).queryKey,
  });
};
