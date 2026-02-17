import type { GetUserRecoveryPackageParams } from "@workspace/shared/schemas/users/get-user-recovery-package";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { getUserRecoveryPackage } from "@/services/users/get-user-recovery-package";

export const userRecoveryPackageQueryOptions = (
  params: GetUserRecoveryPackageParams,
) => {
  return queryOptions({
    queryFn: () => getUserRecoveryPackage(params),
    queryKey: ["user", params.userId, "recovery-package"],
  });
};

export const useUserRecoveryPackage = (params: GetUserRecoveryPackageParams) =>
  useSuspenseQuery({
    ...userRecoveryPackageQueryOptions(params),
    select: (data) => data.data,
  });
