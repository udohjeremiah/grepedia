import {
  GetUserStatParams,
  getUserStatParamsSchema,
  getUserStatResponseSchemas,
} from "@workspace/shared/schemas/users/get-user-stat";

import { apiClient, requestWithAuth } from "@/lib/api-client";

export async function getUserStat(params: GetUserStatParams) {
  const { userId } = getUserStatParamsSchema.parse(params);
  const response = await apiClient.get(
    `/users/${userId}/stat`,
    requestWithAuth(),
  );
  return getUserStatResponseSchemas[200].parse(response.data);
}
