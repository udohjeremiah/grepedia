import type {
  GetToolCommentRepliesParams,
  GetToolCommentRepliesQueryString,
} from "@workspace/shared/schemas/tools/comments/get-tool-comment-replies";

import {
  getToolCommentRepliesParamsSchema,
  getToolCommentRepliesQueryStringSchema,
  getToolCommentRepliesResponseSchemas,
} from "@workspace/shared/schemas/tools/comments/get-tool-comment-replies";

import { apiClient } from "@/lib/api-client";

type GetToolCommentRepliesInput = {
  params: GetToolCommentRepliesParams;
  queryString: GetToolCommentRepliesQueryString;
};

export async function getToolCommentReplies({
  params,
  queryString,
}: GetToolCommentRepliesInput) {
  const { commentId, slug } = getToolCommentRepliesParamsSchema.parse(params);
  const parsedQueryString =
    getToolCommentRepliesQueryStringSchema.parse(queryString);

  const response = await apiClient
    .get(`tools/${slug}/comments/${commentId}/replies`, {
      searchParams: parsedQueryString,
    })
    .json(getToolCommentRepliesResponseSchemas[200]);

  return response;
}
