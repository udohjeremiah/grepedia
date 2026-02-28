import type { GetUserRecoveryPackageParams } from "@workspace/shared/schemas/users/get-user-recovery-package";

import { queryOptions, useQuery } from "@tanstack/react-query";

import { userQueryOptions } from "@/routes/_authenticated/@{$username}/-queries/user";
import { getUserRecoveryPackage } from "@/services/users/get-user-recovery-package";

export const userRecoveryPackageQueryOptions = (
  params: GetUserRecoveryPackageParams,
) => {
  return queryOptions({
    queryFn: () => getUserRecoveryPackage(params),
    queryKey: [...userQueryOptions(params.userId).queryKey, "recovery-package"],
  });
};

export const useUserRecoveryPackage = (
  params: GetUserRecoveryPackageParams,
) => {
  return useQuery({
    ...userRecoveryPackageQueryOptions(params),
    select: (data) => data.data,
  });
};
