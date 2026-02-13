import { getToolsCountResponseSchemas } from "@workspace/shared/schemas/tools/get-tools-count";

import { apiClient } from "@/lib/api-client";

export async function getToolsCount() {
  const response = await apiClient.get("/tools/count");
  return getToolsCountResponseSchemas[200].parse(response.data);
}
