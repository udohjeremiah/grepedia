import { getToolsDirectoryCategoriesResponseSchemas } from "@workspace/shared/schemas/tools/get-tools-directory-categories";

import { apiClient } from "@/lib/api-client";

export async function getToolsDirectoryCategories() {
  const response = await apiClient.get("/tools/directory/categories");
  return getToolsDirectoryCategoriesResponseSchemas[200].parse(response.data);
}
