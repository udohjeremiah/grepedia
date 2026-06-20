import type {
  GetToolCommentsParams,
  GetToolCommentsQueryString,
} from "@workspace/shared/schemas/tools/comments/get-tool-comments";

import {
  getToolCommentsParamsSchema,
  getToolCommentsQueryStringSchema,
  getToolCommentsResponseSchemas,
} from "@workspace/shared/schemas/tools/comments/get-tool-comments";

import { apiClient } from "@/lib/api-client";

type GetToolComments = {
  params: GetToolCommentsParams;
  queryString: GetToolCommentsQueryString;
};

export async function getToolComments({
  params,
  queryString,
}: GetToolComments) {
  const { slug } = getToolCommentsParamsSchema.parse(params);
  const parsedQueryString = getToolCommentsQueryStringSchema.parse(queryString);

  const response = await apiClient
    .get(`tools/${slug}/comments`, { searchParams: parsedQueryString })
    .json(getToolCommentsResponseSchemas[200]);

  return response;
}
