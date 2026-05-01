import {
  moderatorGetCommentQuerySchema,
  moderatorGetCommentResponseSchemas,
} from "@workspace/shared/schemas/moderation/moderator-get-comment";

import { apiClient } from "@/lib/api-client";

export async function moderatorGetComment(commentId: string) {
  const parsedQueryString = moderatorGetCommentQuerySchema.parse({ commentId });
  const response = await apiClient.get("/moderation/comments/lookup", {
    params: parsedQueryString,
  });
  return moderatorGetCommentResponseSchemas[200].parse(response.data);
}
