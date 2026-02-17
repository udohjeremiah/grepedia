import { mutationOptions, useMutation } from "@tanstack/react-query";

import { removeUserBookmark } from "@/services/users/remove-user-bookmark";

import { userBookmarksQueryOptions } from "./user-bookmarks";

export const userRemoveBookmarkMutationOptions = (userId: string) =>
  mutationOptions({
    mutationFn: removeUserBookmark,
    mutationKey: userBookmarksQueryOptions({ userId }).queryKey,
  });

export const useUserRemoveBookmark = (userId: string) =>
  useMutation({
    ...userRemoveBookmarkMutationOptions(userId),
  });
