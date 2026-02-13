import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { GetUserSummaryParams } from "@workspace/shared/schemas/users/get-user-summary";

import { getUserSummary } from "@/services/users/get-user-summary";

export const userSummaryQueryOptions = (params: GetUserSummaryParams) => {
  return queryOptions({
    queryFn: () => getUserSummary(params),
    queryKey: ["user", params.id, "summary"],
  });
};

export const useUserSummary = (params: GetUserSummaryParams) =>
  useSuspenseQuery({
    ...userSummaryQueryOptions(params),
    select: (data) => data.data,
  });
