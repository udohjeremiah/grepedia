import {
  moderatorGetUserQuerySchema,
  moderatorGetUserResponseSchemas,
} from "@workspace/shared/schemas/moderation-case/moderator-get-user";

import { apiClient } from "@/lib/api-client";

export async function moderatorGetUser(username: string) {
  const parsedQueryString = moderatorGetUserQuerySchema.parse({ username });
  const response = await apiClient.get("/moderation/users/lookup", {
    params: parsedQueryString,
  });
  return moderatorGetUserResponseSchemas[200].parse(response.data);
}
