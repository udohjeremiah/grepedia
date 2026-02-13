import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { GetUserDetailsParams } from "@workspace/shared/schemas/users/get-user-details";

import { getUserDetails } from "@/services/users/get-user-details";

export const userDetailsQueryOptions = (params: GetUserDetailsParams) => {
  return queryOptions({
    queryFn: () => getUserDetails(params),
    queryKey: ["user", params.id, "details"],
  });
};

export const useUserDetails = (params: GetUserDetailsParams) =>
  useSuspenseQuery({
    ...userDetailsQueryOptions(params),
    select: (data) => data.data,
  });
