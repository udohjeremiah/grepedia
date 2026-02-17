import type { GetUserParams } from "@workspace/shared/schemas/users/get-user";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { getUser } from "@/services/users/get-user";

export const userQueryOptions = (params: GetUserParams) => {
  return queryOptions({
    queryFn: () => getUser(params),
    queryKey: ["user", params.userId],
  });
};

export const useUser = (params: GetUserParams) =>
  useSuspenseQuery({
    ...userQueryOptions(params),
    select: (data) => data.data.user,
  });
