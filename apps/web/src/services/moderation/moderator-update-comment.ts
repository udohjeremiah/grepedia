import type { ModeratorUpdateCommentBody } from "@workspace/shared/schemas/moderation/moderator-update-comment";

import {
  moderatorUpdateCommentBodySchema,
  moderatorUpdateCommentResponseSchemas,
} from "@workspace/shared/schemas/moderation/moderator-update-comment";

import { apiClient } from "@/lib/api-client";

export async function moderatorUpdateComment(body: ModeratorUpdateCommentBody) {
  const parsedBody = moderatorUpdateCommentBodySchema.parse(body);
  const response = await apiClient.patch(
    "/moderation/comments/update",
    parsedBody,
  );
  return moderatorUpdateCommentResponseSchemas[200].parse(response.data);
}
