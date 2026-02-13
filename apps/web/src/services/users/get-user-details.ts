import {
  GetUserDetailsParams,
  getUserDetailsParamsSchema,
  getUserDetailsResponseSchemas,
} from "@workspace/shared/schemas/users/get-user-details";

import { apiClient, requestWithAuth } from "@/lib/api-client";

export async function getUserDetails(params: GetUserDetailsParams) {
  const { id } = getUserDetailsParamsSchema.parse(params);
  const response = await apiClient.get(
    `/users/${id}/details`,
    requestWithAuth(),
  );
  return getUserDetailsResponseSchemas[200].parse(response.data);
}
