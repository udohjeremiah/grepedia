import type { ModeratorUpdateToolBody } from "@workspace/shared/schemas/moderation/moderator-update-tool";

import {
  moderatorUpdateToolBodySchema,
  moderatorUpdateToolResponseSchemas,
} from "@workspace/shared/schemas/moderation/moderator-update-tool";

import { apiClient } from "@/lib/api-client";

export async function moderatorUpdateTool(body: ModeratorUpdateToolBody) {
  const parsedBody = moderatorUpdateToolBodySchema.parse(body);

  const response = await apiClient
    .patch("moderation/tools/update", { json: parsedBody })
    .json(moderatorUpdateToolResponseSchemas[200]);

  return response;
}
