import {
  GetUserRecoveryPackageParams,
  getUserRecoveryPackageParamsSchema,
  getUserRecoveryPackageResponseSchemas,
} from "@workspace/shared/schemas/users/get-user-recovery-package";

import { apiClient } from "@/lib/api-client";

export async function getUserRecoveryPackage(
  params: GetUserRecoveryPackageParams,
) {
  const { userId } = getUserRecoveryPackageParamsSchema.parse(params);
  const response = await apiClient.get(`/users/${userId}/recovery-package`);
  return getUserRecoveryPackageResponseSchemas[200].parse(response.data);
}
