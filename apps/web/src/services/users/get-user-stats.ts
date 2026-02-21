import {
  GetUserStatsParams,
  getUserStatsParamsSchema,
  getUserStatsResponseSchemas,
} from "@workspace/shared/schemas/users/get-user-stats";

import { apiClient } from "@/lib/api-client";

export async function getUserStats(params: GetUserStatsParams) {
  const { userId } = getUserStatsParamsSchema.parse(params);
  const response = await apiClient.get(`/users/${userId}/stats`);
  return getUserStatsResponseSchemas[200].parse(response.data);
}
