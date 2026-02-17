import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { GetUserRecoveryPackageParams } from "@workspace/shared/schemas/users/get-user-recovery-package";

import { getUserRecoveryPackage } from "@/services/users/get-user-recovery-package";

export const userRecoveryPackageQueryOptions = (
  params: GetUserRecoveryPackageParams,
) => {
  return queryOptions({
    queryFn: () => getUserRecoveryPackage(params),
    queryKey: ["user", params.id, "recovery-package"],
  });
};

export const useUserRecoveryPackage = (params: GetUserRecoveryPackageParams) =>
  useSuspenseQuery({
    ...userRecoveryPackageQueryOptions(params),
    select: (data) => data.data,
  });
