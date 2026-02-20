import type { GetUserStatsParams } from "@workspace/shared/schemas/users/get-user-stats";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { getUserStats } from "@/services/users/get-user-stats";

export const userStatQueryOptions = (params: GetUserStatsParams) => {
  return queryOptions({
    queryFn: () => getUserStats(params),
    queryKey: ["user", params.userId, "stats"],
  });
};

export const useUserStats = (params: GetUserStatsParams) =>
  useSuspenseQuery({
    ...userStatQueryOptions(params),
    select: (data) => data.data.stats,
  });
