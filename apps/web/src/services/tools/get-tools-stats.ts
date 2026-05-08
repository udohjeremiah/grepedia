import { getToolsStatsResponseSchemas } from "@workspace/shared/schemas/tools/get-tools-stats";

import { apiClient } from "@/lib/api-client";

export async function getToolsStats() {
  const response = await apiClient
    .get("tools/stats")
    .json(getToolsStatsResponseSchemas[200]);

  return response;
}
