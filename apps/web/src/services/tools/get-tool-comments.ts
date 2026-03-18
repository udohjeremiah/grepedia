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

type GetToolCommentsInput = {
  params: GetToolCommentsParams;
  queryString: GetToolCommentsQueryString;
};

export async function getToolComments({
  params,
  queryString,
}: GetToolCommentsInput) {
  const { slug } = getToolCommentsParamsSchema.parse(params);
  const parsedQueryString = getToolCommentsQueryStringSchema.parse(queryString);
  const response = await apiClient.get(`/tools/${slug}/comments`, {
    params: parsedQueryString,
  });
  return getToolCommentsResponseSchemas[200].parse(response.data);
}
