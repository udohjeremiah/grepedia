import {
  GetUserToolsParams,
  getUserToolsParamsSchema,
  getUserToolsResponseSchemas,
} from "@workspace/shared/schemas/users/get-user-tools";

import { apiClient } from "@/lib/api-client";

export async function getUserTools(params: GetUserToolsParams) {
  const { userId } = getUserToolsParamsSchema.parse(params);

  const response = await apiClient
    .get(`users/${userId}/tools`)
    .json(getUserToolsResponseSchemas[200]);

  return response;
}
