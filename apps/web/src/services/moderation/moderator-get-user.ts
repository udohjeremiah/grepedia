import {
  moderatorGetUserQuerySchema,
  moderatorGetUserResponseSchemas,
} from "@workspace/shared/schemas/moderation/moderator-get-user";

import { apiClient } from "@/lib/api-client";

export async function moderatorGetUser(username: string) {
  const parsedQueryString = moderatorGetUserQuerySchema.parse({ username });

  const response = await apiClient
    .get("moderation/users/lookup", { searchParams: parsedQueryString })
    .json(moderatorGetUserResponseSchemas[200]);

  return response;
}
