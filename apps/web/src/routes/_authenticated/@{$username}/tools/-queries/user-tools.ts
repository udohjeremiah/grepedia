import type { GetUserToolsParams } from "@workspace/shared/schemas/users/get-user-tools";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { userQueryOptions } from "@/routes/_authenticated/@{$username}/-queries/user";
import { getUserTools } from "@/services/users/get-user-tools";

export const userToolsQueryOptions = (params: GetUserToolsParams) => {
  return queryOptions({
    queryFn: () => getUserTools(params),
    queryKey: [...userQueryOptions(params.userId).queryKey, "tools"],
  });
};

export const useUserTools = (params: GetUserToolsParams) => {
  return useSuspenseQuery({
    ...userToolsQueryOptions(params),
    select: (data) => data.data,
  });
};
