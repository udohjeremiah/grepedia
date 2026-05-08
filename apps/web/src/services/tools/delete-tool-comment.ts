import type { DeleteToolCommentParams } from "@workspace/shared/schemas/tools/comments/delete-tool-comment";

import {
  deleteToolCommentParamsSchema,
  deleteToolCommentResponseSchemas,
} from "@workspace/shared/schemas/tools/comments/delete-tool-comment";

import { apiClient } from "@/lib/api-client";

export async function deleteToolComment(params: DeleteToolCommentParams) {
  const { commentId, slug } = deleteToolCommentParamsSchema.parse(params);

  const response = await apiClient
    .delete(`tools/${slug}/comments/${commentId}`)
    .json(deleteToolCommentResponseSchemas[200]);

  return response;
}
