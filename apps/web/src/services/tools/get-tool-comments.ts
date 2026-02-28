import type {
  GetToolCommentsParams,
  GetToolCommentsQueryString,
} from "@workspace/shared/schemas/tools/get-tool-comments";

import {
  getToolCommentsParamsSchema,
  getToolCommentsQueryStringSchema,
  getToolCommentsResponseSchemas,
} from "@workspace/shared/schemas/tools/get-tool-comments";

import { apiClient } from "@/lib/api-client";

export async function getToolComments(
  params: GetToolCommentsParams,
  queryString: GetToolCommentsQueryString,
) {
  const { slug } = getToolCommentsParamsSchema.parse(params);
  const parsedQueryString = getToolCommentsQueryStringSchema.parse(queryString);
  const response = await apiClient.get(`/tools/${slug}/comments`, {
    params: parsedQueryString,
  });
  return getToolCommentsResponseSchemas[200].parse(response.data);
}
