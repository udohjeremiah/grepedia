import type { ModeratorUpdateUserBody } from "@workspace/shared/schemas/moderation/moderator-update-user";

import {
  moderatorUpdateUserBodySchema,
  moderatorUpdateUserResponseSchemas,
} from "@workspace/shared/schemas/moderation/moderator-update-user";

import { apiClient } from "@/lib/api-client";

export async function moderatorUpdateUser(body: ModeratorUpdateUserBody) {
  const parsedBody = moderatorUpdateUserBodySchema.parse(body);
  const response = await apiClient.patch(
    "/moderation/users/update",
    parsedBody,
  );
  return moderatorUpdateUserResponseSchemas[200].parse(response.data);
}
