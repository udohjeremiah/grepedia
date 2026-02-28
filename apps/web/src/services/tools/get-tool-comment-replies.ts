import type {
  GetToolCommentRepliesParams,
  GetToolCommentRepliesQueryString,
} from "@workspace/shared/schemas/tools/get-tool-comment-replies";

import {
  getToolCommentRepliesParamsSchema,
  getToolCommentRepliesQueryStringSchema,
  getToolCommentRepliesResponseSchemas,
} from "@workspace/shared/schemas/tools/get-tool-comment-replies";

import { apiClient } from "@/lib/api-client";

export async function getToolCommentReplies(
  params: GetToolCommentRepliesParams,
  queryString: GetToolCommentRepliesQueryString,
) {
  const { commentId, slug } = getToolCommentRepliesParamsSchema.parse(params);
  const parsedQueryString =
    getToolCommentRepliesQueryStringSchema.parse(queryString);
  const response = await apiClient.get(
    `/tools/${slug}/comments/${commentId}/replies`,
    {
      params: parsedQueryString,
    },
  );
  return getToolCommentRepliesResponseSchemas[200].parse(response.data);
}
