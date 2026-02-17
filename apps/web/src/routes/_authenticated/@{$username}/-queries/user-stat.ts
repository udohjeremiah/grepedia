import type { GetUserStatParams } from "@workspace/shared/schemas/users/get-user-stat";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { getUserStat } from "@/services/users/get-user-stat";

export const userStatQueryOptions = (params: GetUserStatParams) => {
  return queryOptions({
    queryFn: () => getUserStat(params),
    queryKey: ["user", params.userId, "stat"],
  });
};

export const useUserStat = (params: GetUserStatParams) =>
  useSuspenseQuery({
    ...userStatQueryOptions(params),
    select: (data) => data.data.stat,
  });
