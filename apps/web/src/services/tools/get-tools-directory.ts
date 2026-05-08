import {
  type GetToolsDirectoryQueryString,
  getToolsDirectoryQueryStringSchema,
  getToolsDirectoryResponseSchemas,
} from "@workspace/shared/schemas/tools/directory/get-tools-directory";

import { apiClient } from "@/lib/api-client";

export async function getToolsDirectory(
  queryString: GetToolsDirectoryQueryString,
) {
  const parsedQueryString =
    getToolsDirectoryQueryStringSchema.parse(queryString);

  const response = await apiClient
    .get("tools/directory", { searchParams: parsedQueryString })
    .json(getToolsDirectoryResponseSchemas[200]);

  return response;
}
