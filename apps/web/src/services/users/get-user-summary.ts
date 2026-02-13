import {
  GetUserSummaryParams,
  getUserSummaryParamsSchema,
  getUserSummaryResponseSchemas,
} from "@workspace/shared/schemas/users/get-user-summary";

import { apiClient, requestWithAuth } from "@/lib/api-client";

export async function getUserSummary(params: GetUserSummaryParams) {
  const { id } = getUserSummaryParamsSchema.parse(params);
  const response = await apiClient.get(
    `/users/${id}/summary`,
    requestWithAuth(),
  );
  return getUserSummaryResponseSchemas[200].parse(response.data);
}
