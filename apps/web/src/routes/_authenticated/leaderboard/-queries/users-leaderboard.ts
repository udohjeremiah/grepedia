import type { GetUsersLeaderboardQueryString } from "@workspace/shared/schemas/users/get-users-leaderboard";

import {
  infiniteQueryOptions,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { omitKeys } from "@workspace/shared/omit-keys";

import { getUsersLeaderboard } from "@/services/users/get-users-leaderboard";

export const usersLeaderboardQueryOptions = (
  params: GetUsersLeaderboardQueryString,
) => {
  return infiniteQueryOptions({
    initialPageParam: "",
    queryFn: ({ pageParam }) =>
      getUsersLeaderboard({ ...params, cursor: pageParam }),
    queryKey: ["users", "leaderboard", omitKeys(params, ["cursor", "limit"])],
    // eslint-disable-next-line perfectionist/sort-objects
    getNextPageParam: (lastPage) => lastPage.data.nextCursor,
  });
};

export const useUsersLeaderboard = (params: GetUsersLeaderboardQueryString) => {
  return useSuspenseInfiniteQuery({
    ...usersLeaderboardQueryOptions(params),
    select: (data) => ({
      leaderboard: data.pages.flatMap((page) => page.data.leaderboard),
      totals: data.pages[0]?.data.totals ?? {
        totalAdded: 0,
        totalOwned: 0,
        totalUpdated: 0,
      },
    }),
  });
};
