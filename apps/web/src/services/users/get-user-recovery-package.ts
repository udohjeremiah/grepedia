import {
  GetUserRecoveryPackageParams,
  getUserRecoveryPackageParamsSchema,
  getUserRecoveryPackageResponseSchemas,
} from "@workspace/shared/schemas/users/recovery-package/get-user-recovery-package";

import { apiClient } from "@/lib/api-client";

export async function getUserRecoveryPackage(
  params: GetUserRecoveryPackageParams,
) {
  const { userId } = getUserRecoveryPackageParamsSchema.parse(params);

  const response = await apiClient
    .get(`users/${userId}/recovery-package`)
    .json(getUserRecoveryPackageResponseSchemas[200]);

  return response;
}
