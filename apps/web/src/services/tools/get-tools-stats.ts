import { getToolsStatsResponseSchemas } from "@workspace/shared/schemas/tools/get-tools-stats";

import { apiClient } from "@/lib/api-client";

export async function getToolsStats() {
  const response = await apiClient.get("/tools/stats");
  return getToolsStatsResponseSchemas[200].parse(response.data);
}
