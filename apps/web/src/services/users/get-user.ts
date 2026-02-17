import {
  GetUserParams,
  getUserParamsSchema,
  getUserResponseSchemas,
} from "@workspace/shared/schemas/users/get-user";

import { apiClient, requestWithAuth } from "@/lib/api-client";

export async function getUser(params: GetUserParams) {
  const { userId } = getUserParamsSchema.parse(params);
  const response = await apiClient.get(`/users/${userId}`, requestWithAuth());
  return getUserResponseSchemas[200].parse(response.data);
}
