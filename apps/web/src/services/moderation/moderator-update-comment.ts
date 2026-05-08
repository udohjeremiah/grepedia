import type { ModeratorUpdateCommentBody } from "@workspace/shared/schemas/moderation/moderator-update-comment";

import {
  moderatorUpdateCommentBodySchema,
  moderatorUpdateCommentResponseSchemas,
} from "@workspace/shared/schemas/moderation/moderator-update-comment";

import { apiClient } from "@/lib/api-client";

export async function moderatorUpdateComment(body: ModeratorUpdateCommentBody) {
  const parsedBody = moderatorUpdateCommentBodySchema.parse(body);

  const response = await apiClient
    .patch("moderation/comments/update", { json: parsedBody })
    .json(moderatorUpdateCommentResponseSchemas[200]);

  return response;
}
