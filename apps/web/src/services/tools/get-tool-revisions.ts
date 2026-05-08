import {
  type GetToolRevisionsParams,
  getToolRevisionsParamsSchema,
  type GetToolRevisionsQueryString,
  getToolRevisionsQueryStringSchema,
  getToolRevisionsResponseSchemas,
} from "@workspace/shared/schemas/tools/revisions/get-tool-revisions";

import { apiClient } from "@/lib/api-client";

type GetToolRevisionsInput = {
  params: GetToolRevisionsParams;
  queryString: GetToolRevisionsQueryString;
};

export async function getToolRevisions({
  params,
  queryString,
}: GetToolRevisionsInput) {
  const { slug } = getToolRevisionsParamsSchema.parse(params);
  const parsedQueryString =
    getToolRevisionsQueryStringSchema.parse(queryString);

  const response = await apiClient
    .get(`tools/${slug}/revisions`, { searchParams: parsedQueryString })
    .json(getToolRevisionsResponseSchemas[200]);

  return response;
}
