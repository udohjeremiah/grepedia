import { getToolsDirectoryCategoriesResponseSchemas } from "@workspace/shared/schemas/tools/directory/get-tools-directory-categories";

import { apiClient } from "@/lib/api-client";

export async function getToolsDirectoryCategories() {
  const response = await apiClient
    .get("tools/directory/categories")
    .json(getToolsDirectoryCategoriesResponseSchemas[200]);

  return response;
}
