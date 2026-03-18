import type {
  UpdateToolCommentBody,
  UpdateToolCommentParams,
} from "@workspace/shared/schemas/tools/comments/update-tool-comment";

import {
  updateToolCommentBodySchema,
  updateToolCommentParamsSchema,
  updateToolCommentResponseSchemas,
} from "@workspace/shared/schemas/tools/comments/update-tool-comment";

import { apiClient } from "@/lib/api-client";

type UpdateToolCommentInput = {
  body: UpdateToolCommentBody;
  params: UpdateToolCommentParams;
};

export async function updateToolComment({
  body,
  params,
}: UpdateToolCommentInput) {
  const { commentId, slug } = updateToolCommentParamsSchema.parse(params);
  const parsedBody = updateToolCommentBodySchema.parse(body);
  const response = await apiClient.patch(
    `/tools/${slug}/comments/${commentId}`,
    parsedBody,
  );
  return updateToolCommentResponseSchemas[200].parse(response.data);
}
