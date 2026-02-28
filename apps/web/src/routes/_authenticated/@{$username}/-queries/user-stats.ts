import type { GetUserStatsParams } from "@workspace/shared/schemas/users/get-user-stats";

import { queryOptions, useQuery } from "@tanstack/react-query";

import { userQueryOptions } from "@/routes/_authenticated/@{$username}/-queries/user";
import { getUserStats } from "@/services/users/get-user-stats";

export const userStatQueryOptions = (params: GetUserStatsParams) => {
  return queryOptions({
    queryFn: () => getUserStats(params),
    queryKey: [...userQueryOptions(params.userId).queryKey, "stats"],
  });
};

type UseUserStatsOptions = {
  enabled?: boolean;
};

export const useUserStats = (
  params: GetUserStatsParams,
  options?: UseUserStatsOptions,
) => {
  return useQuery({
    ...userStatQueryOptions(params),
    enabled: options?.enabled ?? true,
    select: (data) => data.data.stats,
  });
};
