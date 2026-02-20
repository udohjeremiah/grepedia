import type { GetUserToolsParams } from "@workspace/shared/schemas/users/get-user-tools";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { getUserTools } from "@/services/users/get-user-tools";

export const userToolsQueryOptions = (params: GetUserToolsParams) => {
  return queryOptions({
    queryFn: () => getUserTools(params),
    queryKey: ["user", params.userId, "tools"],
  });
};

export const useUserTools = (params: GetUserToolsParams) =>
  useSuspenseQuery({
    ...userToolsQueryOptions(params),
    select: (data) => data.data,
  });
