import {
  GetUserToolsParams,
  getUserToolsParamsSchema,
  getUserToolsResponseSchemas,
} from "@workspace/shared/schemas/users/get-user-tools";

import { apiClient, requestWithAuth } from "@/lib/api-client";

export async function getUserTools(params: GetUserToolsParams) {
  const { userId } = getUserToolsParamsSchema.parse(params);
  const response = await apiClient.get(
    `/users/${userId}/tools`,
    requestWithAuth(),
  );
  return getUserToolsResponseSchemas[200].parse(response.data);
}
